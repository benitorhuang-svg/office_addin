
/**
 * Manages the Gemini CLI lifecycle as a child process of the backend server.
 * Note: Since copilot-sdk now dynamically spawns the CLI via stdio, we don't
 * need to artificially maintain a background process on a port.
 */
export function startGeminiCli() {
  console.log('[Gemini CLI] Managed dynamically by Copilot SDK. No manual startup required.');
}

export function stopGeminiCli() {
  // Controlled by SDK
}

export function isGeminiCliRunning() {
  return true; // Assume SDK will spawn it successfully
}
