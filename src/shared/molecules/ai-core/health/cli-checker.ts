import { CopilotClient } from "@github/copilot-sdk";
import type { ACPHealthResult } from '@shared/atoms/ai-core/types.js';
import { CORE_SDK_CONFIG } from '@shared/atoms/ai-core/core-config.js';

/**
 * Molecule: Copilot CLI Baseline Health Checker
 */
export async function checkCliBaselineHealth(): Promise<ACPHealthResult> {
  const start = Date.now();
  const client = new CopilotClient({ cliPath: 'copilot' });
  let timeout: ReturnType<typeof setTimeout> | undefined;

  try {
    await Promise.race([
      client.start(),
      new Promise<never>((_, reject) => {
        timeout = setTimeout(
          () => reject(new Error(`Copilot CLI health check timed out after ${Math.round(CORE_SDK_CONFIG.CLIENT_START_TIMEOUT_MS / 1000)}s`)),
          CORE_SDK_CONFIG.CLIENT_START_TIMEOUT_MS
        );
      }),
    ]);
    return { ok: true, type: 'copilot_cli', latency: Date.now() - start };
  } catch {
    return { ok: false, type: 'none' };
  } finally {
    if (timeout) {
      clearTimeout(timeout);
    }
    await client.stop().catch(() => undefined);
  }
}
