import { approveAll } from "@github/copilot-sdk";
import { ACPSessionConfig, ACPOptions } from "../../atoms/types.js";

/**
 * Molecule: Robust Gemini CLI Option Builder (Windows Compatible)
 * Bypasses Shell scripts like .ps1/.cmd and invokes the core index.js via 'node'.
 * This solves the "Thinking..." hang caused by non-JSON-RPC output on startup.
 */
export const buildGeminiCliOptions = (cfg: ACPSessionConfig): ACPOptions => {
  // Use absolute path identified on this machine for maximum reliability
  const geminiCoreIndex = "C:/Users/benit/AppData/Roaming/npm/node_modules/@google/gemini-cli/dist/index.js";
  
  return {
    clientOptions: {
      // Use process.execPath specifically for Windows safety
      // This ensures we use the exact same Node.js that is running this server
      cliPath: process.execPath,
      useStdio: true,
      // Provide the script path as the first argument, followed by ACP flags
      cliArgs: [geminiCoreIndex, '--acp', '-y'], 
    },
    sessionOptions: {
      streaming: !!cfg.streaming,
      // Default to gemini-2.5-flash as defined in our ModelManager
      model: cfg.model || 'gemini-2.5-flash',
      onPermissionRequest: approveAll,
    },
  };
};
