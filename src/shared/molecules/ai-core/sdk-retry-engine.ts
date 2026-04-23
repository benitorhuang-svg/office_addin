import { CORE_SDK_CONFIG } from '@shared/atoms/ai-core/core-config.js';
import type { ACPConnectionMethod, ACPSessionConfig } from '@shared/atoms/ai-core/types.js';
import { resolveACPOptions } from '@shared/molecules/ai-core/option-resolver.js';
import { logger } from '@shared/logger/index.js';

enum CircuitState {
  CLOSED,
  OPEN,
  HALF_OPEN
}

/**
 * Internal Circuit Breaker to prevent cascading failures
 */
class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount: number = 0;
  private lastFailureTime: number = 0;
  private readonly threshold: number = 5;
  private readonly resetTimeout: number = 60000; // 60 seconds

  public canExecute(): boolean {
    if (this.state === CircuitState.CLOSED) return true;
    if (this.state === CircuitState.OPEN) {
      if (Date.now() - this.lastFailureTime > this.resetTimeout) {
        this.state = CircuitState.HALF_OPEN;
        return true;
      }
      return false;
    }
    return true; // HALF_OPEN allows one trial
  }

  public recordSuccess() {
    this.failureCount = 0;
    this.state = CircuitState.CLOSED;
  }

  public recordFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    if (this.failureCount >= this.threshold) {
      this.state = CircuitState.OPEN;
      logger.error('CircuitBreaker', 'Circuit opened due to repeated failures');
    }
  }
}

const breaker = new CircuitBreaker();

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
    if (!breaker.canExecute()) {
      const circuitError = '[CircuitBreaker] 系統目前偵測到持續性的連線錯誤，請稍後再試。';
      if (onChunk) onChunk(circuitError);
      return circuitError;
    }

    let retryCount = 0;
    const maxRetries = CORE_SDK_CONFIG.MAX_SDK_RETRIES;

    while (retryCount <= maxRetries) {
      try {
        const result = await operation();
        breaker.recordSuccess();
        return result;
      } catch (error: unknown) {
        breaker.recordFailure();
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
          const fallbackText = `${CORE_SDK_CONFIG.ERROR_SDK_CONNECTION_FAIL} (?��?�?{method})?�\n\n?�誤詳�?�?{errorMessage}`;
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
      const { removeClientByParams } = await import('@shared/molecules/ai-core/client-manager.js');
      await removeClientByParams(method, clientOptions);
    } catch (cleanupErr) {
      logger.warn('SdkRetry', 'Failed to cleanup client after retryable error', { method, error: cleanupErr });
    }
  }
}
