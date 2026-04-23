import type { SessionConfig } from "@github/copilot-sdk";
import config from '../../../../config/env.js';
import * as path from 'node:path';
import { handleCopilotPermissionRequest } from '../../atoms/permission-policy.js';
import type { ACPSessionConfig, ACPOptions, ACPProviderConfig } from "../../atoms/types.js";
import { CORE_SDK_CONFIG } from "../../atoms/core-config.js";

const projectRoot = process.cwd();

/**
 * Molecule: Azure OpenAI BYOK Option Builder
 */
export const buildAzureByokOptions = (cfg: ACPSessionConfig): ACPOptions => {
  const azureKey = cfg.azure?.apiKey || config.AZURE_OPENAI_API_KEY;
  const azureEndpoint = cfg.azure?.endpoint || config.AZURE_OPENAI_ENDPOINT;
  const azureDeployment = cfg.azure?.deployment || config.AZURE_OPENAI_DEPLOYMENT;

  const provider: ACPProviderConfig = {
    type: 'azure',
    baseUrl: azureEndpoint || '',
    apiKey: azureKey || undefined,
    azure: { apiVersion: CORE_SDK_CONFIG.AZURE_API_VERSION },
  };

  return {
    clientOptions: { 
      // Windows: JS files are not executables! Use node.exe explicitly.
      cliPath: process.execPath,
      useStdio: true,
      cliArgs: [
        path.join(projectRoot, 'backend/scripts/core/acp-adaptive-shim.cjs'),
        path.join(projectRoot, 'node_modules/@github/copilot/index.js')
      ], 
    },
    sessionOptions: {
      model: azureDeployment || cfg.model,
      streaming: cfg.streaming,
      provider: provider as SessionConfig['provider'],
      onPermissionRequest: handleCopilotPermissionRequest,
    },
  };
};
