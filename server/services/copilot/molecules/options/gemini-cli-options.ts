import { approveAll } from "@github/copilot-sdk";
import { fileURLToPath } from 'node:url';
import * as path from 'node:path';
import config from '../../../../config/env.js';

import { ACPSessionConfig, ACPOptions } from "../../atoms/types.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '../../../../../');

/**
 * Molecule: Robust Gemini CLI Option Builder (Windows Compatible)
 * Routes Gemini through the local wrapper bridge so the Copilot SDK can
 * speak ACP v2/v3 while Gemini CLI remains on its native protocol.
 */
export const buildGeminiCliOptions = (cfg: ACPSessionConfig): ACPOptions => {
  const wrapperEntry = path.join(projectRoot, 'scripts/gemini-wrapper-v2.js');
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
        wrapperEntry
      ],




      env: {
        ...process.env,
        NODE_NO_WARNINGS: process.env.NODE_NO_WARNINGS || '1',
        GEMINI_API_KEY: cfg.geminiKey || config.GEMINI_API_KEY || process.env.GEMINI_API_KEY,
      },
      onListModels: async () => availableModels,
    },
    sessionOptions: {
      streaming: !!cfg.streaming,
      // Default to gemini-2.5-flash as defined in our ModelManager
      model: cfg.model || 'gemini-2.5-flash',
      onPermissionRequest: approveAll,
    },
  };
};
