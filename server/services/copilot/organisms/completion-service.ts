import config from '../../../config/molecules/server-config.js';
import { OfficeContext } from '../atoms/types.js';
import { emitChunks } from '../atoms/formatters.js';
import { GeminiRestService } from './gemini-rest-service.js';
import { GitHubModelsService } from './github-models-service.js';
import { PromptOrchestrator } from './prompt-orchestrator.js';
import { FallbackChain } from '../molecules/fallback-chain.js';

export interface CompletionRequest {
  prompt: string;
  officeContext: OfficeContext;
  model?: string;
  presetId?: string;
  stream?: boolean;
  authProvider?: string;
  geminiKey?: string;
}

/**
 * Organism: Modern Completion Service
 * Updated to use ModernSDKOrchestrator with enhanced error handling and performance
 */
export const CompletionService = {
  async execute(req: CompletionRequest, onChunk?: (chunk: string) => void): Promise<string | void> {
    const resolvedModel = req.model || config.COPILOT_MODEL;
    const { system, user } = PromptOrchestrator.buildWordPrompt(req.prompt, req.officeContext, resolvedModel, req.presetId || 'general');

    try {
      // Branch 1: GitHub Models API (Direct REST)
      if (req.authProvider === 'github_models') {
        const token = config.getModelsToken();
        return await GitHubModelsService.send(token, resolvedModel, { system, user }, onChunk);
      }

      // Branch 2: Gemini Direct API (Native REST)
      if (req.authProvider === 'gemini_api' && req.geminiKey) {
        if (req.stream) {
          for await (const chunk of GeminiRestService.stream(req.geminiKey, resolvedModel, { system, user })) {
            onChunk?.(chunk);
          }
          return;
        } else {
          return await GeminiRestService.send(req.geminiKey, resolvedModel, { system, user });
        }
      }

      // Branch 3: Modern Copilot SDK (CLI-based / BYOK) with enhanced orchestrator
      const isExplicitGeminiCli = req.authProvider === 'gemini_cli';
      const patToken = config.getServerPatToken();
      const { sendPromptViaCopilotSdk } = await import('./sdk-provider.js');

      const streamedText = await sendPromptViaCopilotSdk(
        user, 
        patToken, 
        onChunk, 
        isExplicitGeminiCli, 
        resolvedModel,
        undefined, // azure info
        isExplicitGeminiCli ? 'gemini_cli' : undefined,
        req.geminiKey
      );

      // Gemini CLI can occasionally finish the SSE path without any user-visible text.
      // Fallback to a non-streaming request so the UI gets a concrete answer instead of an empty bubble.
      if (isExplicitGeminiCli && req.stream && !String(streamedText || '').trim()) {
        console.warn('[Modern CompletionService] Empty Gemini CLI streaming result. Retrying once with non-streaming fallback.');
        const fallbackText = await sendPromptViaCopilotSdk(
          user,
          patToken,
          undefined,
          true,
          resolvedModel,
          undefined,
          'gemini_cli',
          req.geminiKey
        );

        if (fallbackText && onChunk) {
          await emitChunks(fallbackText, onChunk);
        }
        return fallbackText;
      }

      return streamedText;
    } catch (err: unknown) {
      console.error('[Modern CompletionService Error]', err);

      // Attempt fallback chain if configured and this isn't already a fallback
      const chain = FallbackChain.fromEnv();
      if (chain) {
        console.warn('[CompletionService] Primary model failed, attempting fallback chain...');
        try {
          const fallbackResult = await chain.execute(async (fallbackModel) => {
            const { system: _s, user: u } = PromptOrchestrator.buildWordPrompt(req.prompt, req.officeContext, fallbackModel, req.presetId || 'general');
            // Use Copilot SDK for fallback models
            const patToken = config.getServerPatToken();
            const { sendPromptViaCopilotSdk } = await import('./sdk-provider.js');
            const text = await sendPromptViaCopilotSdk(u, patToken, onChunk, false, fallbackModel);
            return text;
          });
          if (fallbackResult.fallbackUsed) {
            console.log(`[CompletionService] Fallback succeeded with model: ${fallbackResult.model}`);
          }
          return fallbackResult.result;
        } catch (fallbackErr) {
          console.error('[CompletionService] Fallback chain exhausted:', fallbackErr);
        }
      }

      throw err;
    }
  }
};
