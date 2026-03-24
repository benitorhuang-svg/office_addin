import { CORE_SDK_CONFIG } from '../atoms/core-config.js';

/**
 * Molecule: Pending Input Queue
 * Manages the lifecycle of interactive ask_user requests between SDK sessions and the frontend.
 */

type InputResolver = (response: string) => void;

const MAX_PENDING = 100;
const pendingInputs = new Map<string, InputResolver>();

export function resolveInput(sessionId: string, answer: string): boolean {
  const resolve = pendingInputs.get(sessionId);
  if (resolve) {
    resolve(answer);
    pendingInputs.delete(sessionId);
    return true;
  }
  return false;
}

/**
 * Creates a Promise that waits for an external answer to arrive via `resolveInput`.
 * Includes timeout protection and queue eviction.
 */
export function waitForUserInput(
  sessionId: string,
  question: string,
  onChunk?: (chunk: string) => void
): Promise<{ answer: string; wasFreeform: boolean }> {
  console.log(`[SDK V2] AI is asking: ${question}`);

  if (onChunk) {
    onChunk(`[ASK_USER]:${sessionId}:${question}`);
  }

  return new Promise((resolve) => {
    pendingInputs.set(sessionId, (answer) => {
      resolve({ answer, wasFreeform: true });
    });

    setTimeout(() => {
      if (pendingInputs.has(sessionId)) {
        pendingInputs.delete(sessionId);
        resolve({ answer: "User did not respond in time.", wasFreeform: true });
      }
    }, CORE_SDK_CONFIG.USER_INPUT_TIMEOUT_MS);

    if (pendingInputs.size > MAX_PENDING) {
      const oldest = pendingInputs.keys().next().value;
      if (oldest) pendingInputs.delete(oldest);
    }
  });
}

export function clearAllPendingInputs(): void {
  pendingInputs.clear();
}

export function deletePendingInput(sessionId: string): void {
  pendingInputs.delete(sessionId);
}
