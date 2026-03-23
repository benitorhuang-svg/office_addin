import path from 'path';
import { approveAll } from "@github/copilot-sdk";
import { ACPSessionConfig, ACPOptions } from "../../atoms/types.js";

/**
 * Molecule: Modern Gemini CLI Option Builder
 * Updated for SDK 0.2.0+ — wrapper converts mcpServers Record→Array internally
 */
export const buildGeminiCliOptions = (cfg: ACPSessionConfig): ACPOptions => {
  const repoRoot = path.resolve(process.cwd());
  return {
    clientOptions: {
      cliPath: path.join(repoRoot, 'scripts', 'gemini-wrapper-v2.js'),
      useStdio: true,
      cliArgs: [],
    },
    sessionOptions: {
      streaming: !!cfg.streaming,
      model: cfg.model || 'gemini-1.5-pro',
      onPermissionRequest: approveAll,
    },
  };
};
