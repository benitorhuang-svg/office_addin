import path from 'path';
import { approveAll } from "@github/copilot-sdk";
import { ACPSessionConfig, ACPOptions } from "../../atoms/types.js";

/**
 * Molecule: Gemini CLI Option Builder
 */
export const buildGeminiCliOptions = (cfg: ACPSessionConfig): ACPOptions => {
  const repoRoot = path.resolve(process.cwd());
  return {
    clientOptions: {
      cliPath: path.join(repoRoot, 'scripts', 'gemini-wrapper.js'),
      useStdio: true,
      cliArgs: [],
    },
    sessionOptions: {
      streaming: cfg.streaming,
      onPermissionRequest: approveAll,
    },
  };
};
