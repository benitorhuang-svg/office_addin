import { CORE_SDK_CONFIG } from '../atoms/core-config.js';
import type { ACPConnectionMethod, ACPSessionConfig } from '../atoms/types.js';
import { resolveACPOptions } from './option-resolver.js';
import { logger } from '../../../core/atoms/logger.js';

/**
 * Molecule: SDK Retry Engine
 * Manages the retry loop, backoff delays, and client cleanup during SDK errors.
 */
export class SdkRetryEngine {
  public static async executeWithRetry<T>(
    operation: () => Promise<T>,
    method: ACPConnectionMethod,
    acpConfig: ACPSessionConfig,
    onChunk?: (chunk: string) => void
  ): Promise<T | string> {
    let retryCount = 0;
    const maxRetries = CORE_SDK_CONFIG.MAX_SDK_RETRIES;

    while (retryCount <= maxRetries) {
      try {
        return await operation();
      } catch (error: unknown) {
        // SDK spec: never retry an AbortError ??the client explicitly cancelled.
        if (error instanceof DOMException && error.name === 'AbortError') {
          throw error;
        }

        retryCount++;
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error('SdkRetry', 'SDK retry attempt failed', {
          attempt: retryCount,
          totalAttempts: maxRetries + 1,
          method,
          error: errorMessage,
        });

        // Notify client about failures
        await this.handleClientCleanup(method, acpConfig);

        if (retryCount > maxRetries) {
          const fallbackText = `${CORE_SDK_CONFIG.ERROR_SDK_CONNECTION_FAIL} (?¹å?ï¼?{method})?‚\n\n?¯èª¤è©³æ?ï¼?{errorMessage}`;
          if (onChunk) onChunk(fallbackText);
          return fallbackText;
        }

        // SDK spec: respect Retry-After if present, otherwise exponential back-off with full jitter
        const retryAfterMs = this.extractRetryAfterMs(error);
        const baseDelay = retryAfterMs ?? Math.min(500 * Math.pow(2, retryCount), 8000);
        // Full jitter: random in [0, baseDelay] to avoid thundering herd
        const jitter = Math.random() * baseDelay;
        logger.info('SdkRetry', 'Retrying failed SDK request', {
          method,
          retryInMs: Math.round(jitter),
          attempt: retryCount + 1,
        });
        await new Promise(resolve => setTimeout(resolve, jitter));
      }
    }

    return 'Unexpected error in retry loop';
  }

  private static extractRetryAfterMs(error: unknown): number | null {
    // SDK errors may carry retryAfter (seconds) or a Retry-After header value
    if (error && typeof error === 'object') {
      const e = error as Record<string, unknown>;
      if (typeof e['retryAfter'] === 'number') return e['retryAfter'] * 1000;
      if (typeof e['retryAfterMs'] === 'number') return e['retryAfterMs'];
      const headers = e['headers'] as Record<string, string> | undefined;
      const ra = headers?.['retry-after'] ?? headers?.['Retry-After'];
      if (ra) {
        const parsed = Number(ra);
        if (!isNaN(parsed)) return parsed * 1000;
      }
    }
    return null;
  }

  private static async handleClientCleanup(method: ACPConnectionMethod, acpConfig: ACPSessionConfig) {
    try {
      const { clientOptions } = resolveACPOptions(acpConfig);
      const { removeClientByParams } = await import('./client-manager.js');
      await removeClientByParams(method, clientOptions);
    } catch (cleanupErr) {
      logger.warn('SdkRetry', 'Failed to cleanup client after retryable error', { method, error: cleanupErr });
    }
  }
}
