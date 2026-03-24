import { approveAll } from "@github/copilot-sdk";
import { fileURLToPath } from 'node:url';
import * as path from 'node:path';
import config from '../../../../config/env.js';
import { ACPSessionConfig, ACPOptions } from "../../atoms/types.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '../../../../../');

/**
 * Molecule: Copilot CLI Option Builder resolved for version 0.2.0 compatibility.
 */
export const buildCopilotCliOptions = (cfg: ACPSessionConfig): ACPOptions => {
  const modelsToken = cfg.githubToken || config.getModelsToken();
  const apiBase = config.COPILOT_API_URL;
  
  return {
    clientOptions: { 
      // Windows: JS files are not executables! Use node.exe explicitly.
      cliPath: process.execPath,
      useStdio: true,
      cliArgs: [
        '--no-warnings',
        path.join(projectRoot, 'node_modules/@github/copilot/index.js')
      ],



      env: {
        ...process.env,
        NODE_NO_WARNINGS: '1',
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
