import { CORE_SDK_CONFIG } from '../atoms/core-config.js';
import { ACPConnectionMethod, ACPSessionConfig } from '../atoms/types.js';
import { resolveACPOptions } from './option-resolver.js';

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
      } catch (error: any) {
        retryCount++;
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`[Retry Engine] Attempt ${retryCount}/${maxRetries + 1} failed:`, errorMessage);

        // Notify client about failures
        await this.handleClientCleanup(method, acpConfig);

        if (retryCount > maxRetries) {
          const fallbackText = `${CORE_SDK_CONFIG.ERROR_SDK_CONNECTION_FAIL} (方式：${method})。\n\n錯誤詳情：${errorMessage}`;
          if (onChunk) onChunk(fallbackText);
          return fallbackText;
        }

        const delay = Math.min(500 * Math.pow(2, retryCount), 5000);
        console.log(`[Retry Engine] Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    return 'Unexpected error in retry loop';
  }

  private static async handleClientCleanup(method: ACPConnectionMethod, acpConfig: ACPSessionConfig) {
    try {
      const { clientOptions } = resolveACPOptions(acpConfig);
      const { removeClientByParams } = await import('./client-manager.js');
      await removeClientByParams(method, clientOptions);
    } catch (cleanupErr) {
      console.warn(`[Retry Engine] Cleanup error:`, cleanupErr);
    }
  }
}
