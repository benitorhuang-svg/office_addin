import { CORE_SDK_CONFIG } from '../atoms/core-config.js';
import { logger } from '../../../core/atoms/logger.js';

/**
 * Molecule: Pending Input Queue
 * Manages the lifecycle of interactive ask_user requests between SDK sessions and the frontend.
 */

interface UserInputResult {
  answer: string;
  wasFreeform: boolean;
}

interface PendingInputEntry {
  resolve: (response: UserInputResult) => void;
  timeout: ReturnType<typeof setTimeout>;
  abortCleanup?: () => void;
}

const MAX_PENDING = 100;
const pendingInputs = new Map<string, PendingInputEntry>();
const USER_INPUT_TIMEOUT_RESPONSE: UserInputResult = {
  answer: 'User did not respond in time.',
  wasFreeform: true,
};
const USER_INPUT_CANCELLED_RESPONSE: UserInputResult = {
  answer: 'User input request cancelled because the current request ended.',
  wasFreeform: true,
};
const USER_INPUT_EVICTED_RESPONSE: UserInputResult = {
  answer: 'User input queue full; request evicted.',
  wasFreeform: true,
};

function settlePendingInput(sessionId: string, response: UserInputResult): boolean {
  const entry = pendingInputs.get(sessionId);
  if (!entry) {
    return false;
  }

  pendingInputs.delete(sessionId);
  clearTimeout(entry.timeout);
  entry.abortCleanup?.();
  entry.resolve(response);
  return true;
}

export function resolveInput(sessionId: string, answer: string): boolean {
  return settlePendingInput(sessionId, { answer, wasFreeform: true });
}

/**
 * Creates a Promise that waits for an external answer to arrive via `resolveInput`.
 * Includes timeout protection and queue eviction.
 */
export function waitForUserInput(
  sessionId: string,
  question: string,
  onChunk?: (chunk: string) => void,
  signal?: AbortSignal
): Promise<UserInputResult> {
  logger.info('PendingInput', 'Awaiting user input', { sessionId, question });

  if (onChunk) {
    onChunk(`[ASK_USER]:${sessionId}:${question}`);
  }

  if (signal?.aborted) {
    return Promise.resolve(USER_INPUT_CANCELLED_RESPONSE);
  }

  return new Promise((resolve) => {
    // Evict the oldest entry BEFORE adding, so the Map never exceeds MAX_PENDING.
    if (pendingInputs.size >= MAX_PENDING) {
      const oldest = pendingInputs.keys().next().value;
      if (typeof oldest === 'string' && settlePendingInput(oldest, USER_INPUT_EVICTED_RESPONSE)) {
        logger.warn('PendingInput', 'Evicted oldest pending user input', { sessionId: oldest, maxPending: MAX_PENDING });
      }
    }

    const timeout = setTimeout(() => {
      if (settlePendingInput(sessionId, USER_INPUT_TIMEOUT_RESPONSE)) {
        logger.warn('PendingInput', 'Timed out waiting for user input', { sessionId });
      }
    }, CORE_SDK_CONFIG.USER_INPUT_TIMEOUT_MS);
    timeout.unref?.();

    const entry: PendingInputEntry = {
      resolve,
      timeout,
    };

    if (signal) {
      const handleAbort = () => {
        if (settlePendingInput(sessionId, USER_INPUT_CANCELLED_RESPONSE)) {
          logger.info('PendingInput', 'Cancelled pending user input on abort', { sessionId });
        }
      };

      signal.addEventListener('abort', handleAbort, { once: true });
      entry.abortCleanup = () => signal.removeEventListener('abort', handleAbort);
    }

    pendingInputs.set(sessionId, entry);
  });
}

export function clearAllPendingInputs(): void {
  for (const sessionId of Array.from(pendingInputs.keys())) {
    if (settlePendingInput(sessionId, USER_INPUT_CANCELLED_RESPONSE)) {
      logger.info('PendingInput', 'Cleared pending user input during global cleanup', { sessionId });
    }
  }
}

export function deletePendingInput(sessionId: string): void {
  if (settlePendingInput(sessionId, USER_INPUT_CANCELLED_RESPONSE)) {
    logger.info('PendingInput', 'Cleared pending user input during session cleanup', { sessionId });
  }
}
