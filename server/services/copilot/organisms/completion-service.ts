import config from '../../../config/env.js';
import * as sdkProvider from '../sdkProvider.js';
import { GeminiRestService } from './gemini-rest-service.js';
import { GitHubModelsService } from './github-models-service.js';
import { buildWordPrompt } from '../../promptBuilder.js';

export interface CompletionRequest {
  prompt: string;
  officeContext: any;
  model?: string;
  stream?: boolean;
  authProvider?: string;
  geminiKey?: string;
}

/**
 * Organism: Completion Service
 * High-level service that decides between native SDK, GitHub Models, or direct Gemini API.
 * Orchestrates Prompt Building -> Provider Selection -> Execution.
 */
export const CompletionService = {
  async execute(req: CompletionRequest, onChunk?: (chunk: string) => void): Promise<string | void> {
    const resolvedModel = req.model || config.COPILOT_MODEL;
    const { system, user } = buildWordPrompt(req.prompt, req.officeContext, resolvedModel, 'generic');

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

      // Branch 3: Official Copilot SDK (CLI-based / BYOK)
      const isExplicitGeminiCli = req.authProvider === 'gemini_cli';
      const patToken = config.getServerPatToken();

      return await sdkProvider.sendPromptViaCopilotSdk(
        user, 
        patToken, 
        onChunk, 
        isExplicitGeminiCli, 
        resolvedModel,
        undefined, // azure info
        isExplicitGeminiCli ? 'gemini_cli' : undefined
      );
    } catch (err) {
      console.error('[CompletionService Error]', err);
      throw err;
    }
  }
};
