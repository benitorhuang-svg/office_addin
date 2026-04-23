import * as path from 'node:path';
import * as fs from 'node:fs';
import * as os from 'node:os';
import config from '../../../../config/env.js';

import { handleCopilotPermissionRequest } from '../../atoms/permission-policy.js';
import type { ACPSessionConfig, ACPOptions } from "../../atoms/types.js";
import { logger } from '../../../../core/atoms/logger.js';

const projectRoot = process.cwd();

/**
 * Molecule: Robust Gemini CLI Option Builder (Windows Compatible)
 * Routes Gemini through the local wrapper bridge so the Copilot SDK can
 * speak ACP v2/v3 while Gemini CLI remains on its native protocol.
 */
export const buildGeminiCliOptions = (cfg: ACPSessionConfig): ACPOptions => {
  const wrapperEntry = path.join(projectRoot, 'backend/scripts/gemini-wrapper-v2.js');
  const availableModels = config.AVAILABLE_MODELS_GEMINI.map((modelId) => ({
    id: modelId,
    name: modelId,
    capabilities: {
      supports: {
        vision: false,
        reasoningEffort: false,
      },
      limits: {
        max_context_window_tokens: 1048576,
      },
    },
  }));

  return {
    clientOptions: {
      cliPath: process.execPath,
      useStdio: true,
      cliArgs: [
        '--no-warnings',
        wrapperEntry
      ],




      env: (() => {
        const { GEMINI_API_KEY: _inherited, ...cleanEnv } = process.env;
        const explicitKey = cfg.geminiKey || config.GEMINI_API_KEY || '';
        
        let cloudAuthEnv: Record<string, string> = {};
        const authJson = process.env.GEMINI_CLI_AUTH_JSON;
        
        // If running in cloud (Docker/Cloud Run) with provided Auth JSON string
        if (authJson && !explicitKey) {
            try {
                const tempAuthPath = path.join(os.tmpdir(), 'gemini-auth-token.json');
                fs.writeFileSync(tempAuthPath, authJson);
                logger.info('GeminiCliOptions', 'Injected temporary cloud auth credentials for Gemini CLI', {
                  tempAuthPath,
                });
                cloudAuthEnv = {
                    GOOGLE_APPLICATION_CREDENTIALS: tempAuthPath,
                    // Force the CLI to use this path instead of ~/.gemini/auth
                    GEMINI_AUTH_PATH: tempAuthPath
                };
            } catch (e) {
                logger.error('GeminiCliOptions', 'Failed to write temporary cloud auth credentials', {
                  error: e,
                });
            }
        }

        return {
          ...cleanEnv,
          ...cloudAuthEnv,
          NODE_NO_WARNINGS: process.env.NODE_NO_WARNINGS || '1',
          ...(explicitKey ? { GEMINI_API_KEY: explicitKey } : {}),
        };
      })(),
      onListModels: async () => availableModels,
    },
    sessionOptions: {
      streaming: !!cfg.streaming,
      // Default to gemini-2.5-flash as defined in our ModelManager
      model: cfg.model || 'gemini-2.5-flash',
      onPermissionRequest: handleCopilotPermissionRequest,
    },
  };
};
