import config from '@config/molecules/server-config.js';
import type { OfficeContext } from '@shared/atoms/ai-core/types.js';
import { emitChunks } from '@shared/atoms/ai-core/formatters.js';
import { GeminiRestService } from '@shared/molecules/ai-core/organisms/gemini-rest-service.js';
import { GitHubModelsService } from '@shared/molecules/ai-core/organisms/github-models-service.js';
import { PromptOrchestrator } from '@shared/molecules/ai-core/organisms/prompt-orchestrator.js';
import { FallbackChain } from '@shared/molecules/ai-core/fallback-chain.js';
import { sendPromptViaCopilotSdk } from '@shared/molecules/ai-core/organisms/sdk-provider.js';
import { logger } from '@shared/logger/index.js';

export interface CompletionRequest {
  prompt: string;
  officeContext: OfficeContext;
  model?: string;
  presetId?: string;
  stream?: boolean;
  authProvider?: string;
  geminiKey?: string;
  systemPrompt?: string;
  sessionId?: string; // Added sessionId
}

/**
 * Organism: Modern Completion Service
 * Updated to use ModernSDKOrchestrator with enhanced error handling and performance
 */
export const CompletionService = {
  async execute(req: CompletionRequest, onChunk?: (chunk: string) => void, signal?: AbortSignal): Promise<string | void> {
    const resolvedModel = req.model || config.COPILOT_MODEL;
    const { system, user } = PromptOrchestrator.buildWordPrompt(
      req.prompt, 
      req.officeContext, 
      resolvedModel, 
      req.presetId || 'general',
      req.systemPrompt
    );

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

      // Build a clean two-part prompt; tool use is driven by registered SessionConfig.tools,
      // not inline prompt injection (SDK spec: tools must be registered, not injected).
      const combinedPrompt = `${system}\n\n${user}`;

      const streamedText = await sendPromptViaCopilotSdk(
        combinedPrompt,
        onChunk,
        isExplicitGeminiCli,
        resolvedModel,
        undefined, // azure info
        isExplicitGeminiCli ? 'gemini_cli' : undefined,
        req.geminiKey,
        req.officeContext,
        signal,
        req.sessionId // Pass sessionId to orchestrator
      );

      // Gemini CLI can occasionally finish the SSE path without any user-visible text.
      // Fallback to a non-streaming request so the UI gets a concrete answer instead of an empty bubble.
      if (isExplicitGeminiCli && req.stream && !String(streamedText || '').trim()) {
        logger.warn('CompletionService', 'Empty Gemini CLI streaming result; retrying once with non-streaming fallback', {
          model: resolvedModel,
          authProvider: req.authProvider,
        });
        const fallbackText = await sendPromptViaCopilotSdk(
          user,
          undefined,
          true,
          resolvedModel,
          undefined,
          'gemini_cli',
          req.geminiKey,
          req.officeContext,
          signal  // propagate abort to fallback ??avoids resource leak on disconnect
        );

        if (fallbackText && onChunk) {
          await emitChunks(fallbackText, onChunk);
        }
        return fallbackText;
      }

      return streamedText;
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        logger.info('CompletionService', 'Completion aborted by caller', {
          model: resolvedModel,
          authProvider: req.authProvider,
        });
        throw err;
      }

      logger.error('CompletionService', 'Primary completion path failed', {
        model: resolvedModel,
        authProvider: req.authProvider,
        error: err,
      });

      // Attempt fallback chain if configured and this isn't already a fallback
      const chain = FallbackChain.fromEnv();
      if (chain) {
        logger.warn('CompletionService', 'Primary model failed; attempting fallback chain', {
          model: resolvedModel,
          authProvider: req.authProvider,
        });
        try {
          const fallbackResult = await chain.execute(async (fallbackModel) => {
            const { system: _s, user: u } = PromptOrchestrator.buildWordPrompt(req.prompt, req.officeContext, fallbackModel, req.presetId || 'general');
            // Use Copilot SDK for fallback models
            const text = await sendPromptViaCopilotSdk(
              u,
              onChunk,
              false,
              fallbackModel,
              undefined,
              undefined,
              undefined,
              req.officeContext,
              signal,
            );
            return text;
          });
          if (fallbackResult.fallbackUsed) {
            logger.info('CompletionService', 'Fallback model succeeded', {
              primaryModel: resolvedModel,
              fallbackModel: fallbackResult.model,
            });
          }
          return fallbackResult.result;
        } catch (fallbackErr) {
          logger.error('CompletionService', 'Fallback chain exhausted', {
            primaryModel: resolvedModel,
            error: fallbackErr,
          });
        }
      }

      throw err;
    }
  }
};
