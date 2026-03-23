import { approveAll } from "@github/copilot-sdk";
import { ACPSessionConfig, ACPOptions } from "../../atoms/types.js";

/**
 * Molecule: Robust Gemini CLI Option Builder (Windows Compatible)
 * Bypasses Shell scripts like .ps1/.cmd and invokes the core index.js via 'node'.
 * This solves the "Thinking..." hang caused by non-JSON-RPC output on startup.
 */
export const buildGeminiCliOptions = (cfg: ACPSessionConfig): ACPOptions => {
  // Use absolute path identified on this machine for maximum reliability
  // Resolve gemini-cli index dynamically from devDependencies
  const geminiCoreIndex = require.resolve("@google/gemini-cli/dist/index.js");
  
  return {
    clientOptions: {
      // Use process.execPath specifically for Windows safety
      // This ensures we use the exact same Node.js that is running this server
      cliPath: process.execPath,
      useStdio: true,
      // Filter out flags that gemini-cli does not support (like --headless, --stdio, etc.)
      cliArgs: [
        '-e', 
        `const { spawn } = require('child_process'); 
         const args = process.argv.slice(2).filter(a => ![
           '--headless', '--auto-update', '--autoUpdate', 
           '--log-level', '--logLevel', '--stdio'
         ].includes(a)); 
         spawn(process.execPath, [args[0], ...args.slice(1)], { stdio: 'inherit' });`,
        geminiCoreIndex, '--acp', '-y'
      ], 
    },
    sessionOptions: {
      streaming: !!cfg.streaming,
      // Default to gemini-2.5-flash as defined in our ModelManager
      model: cfg.model || 'gemini-2.5-flash',
      onPermissionRequest: approveAll,
    },
  };
};
