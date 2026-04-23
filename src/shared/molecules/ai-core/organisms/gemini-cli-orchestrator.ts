
/**
 * Manages the Gemini CLI lifecycle as a child process of the backend server.
 * Note: Since copilot-sdk now dynamically spawns the CLI via stdio, we don't
 * need to artificially maintain a background process on a port.
 */
import { logger } from '@shared/logger/index.js';

export function startGeminiCli() {
  logger.info('GeminiCliOrchestrator', 'Gemini CLI is managed dynamically by Copilot SDK; no manual startup required');
}

export function stopGeminiCli() {
  // Controlled by SDK
}

export function isGeminiCliRunning() {
  return true; // Assume SDK will spawn it successfully
}
