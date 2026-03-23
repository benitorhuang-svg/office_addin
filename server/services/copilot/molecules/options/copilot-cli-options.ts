import { approveAll } from "@github/copilot-sdk";
import config from '../../../../config/env.js';
import { ACPSessionConfig, ACPOptions } from "../../atoms/types.js";

/**
 * Molecule: Copilot CLI Option Builder
 */
export const buildCopilotCliOptions = (cfg: ACPSessionConfig): ACPOptions => {
  const modelsToken = config.getModelsToken();
  const apiBase = config.COPILOT_API_URL;

  return {
    clientOptions: { 
      cliPath: 'copilot',
      env: {
        ...process.env,
        ...(apiBase ? {
          COPILOT_API_URL: apiBase,
          GITHUB_API_URL: apiBase,
        } : {}),
        GITHUB_MODELS_API_VERSION: config.GITHUB_MODELS_API_VERSION,
        GITHUB_TOKEN: modelsToken || process.env.GITHUB_TOKEN,
        GH_TOKEN: modelsToken || process.env.GH_TOKEN,
      }
    },
    sessionOptions: {
      model: cfg.model,
      streaming: cfg.streaming,
      onPermissionRequest: approveAll,
      provider: apiBase ? {
        type: 'openai',
        baseUrl: apiBase,
        bearerToken: modelsToken || undefined,
      } : undefined,
    },
  };
};
