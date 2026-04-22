import { getOrCreateClient } from '../../molecules/client-manager.js';
import type { ACPHealthResult } from '../../atoms/types.js';

/**
 * Molecule: Remote CLI Health Checker
 */
export async function checkRemoteHealth(port: string): Promise<ACPHealthResult | null> {
  const start = Date.now();
  let timeout: ReturnType<typeof setTimeout> | undefined;

  try {
    const client = await getOrCreateClient('remote_cli', { 
      cliUrl: `localhost:${port}`,
      cliPath: 'copilot'
    });
    await Promise.race([
      client.ping('health'),
      new Promise<never>((_, reject) => {
        timeout = setTimeout(() => reject(new Error('Remote CLI health check timed out')), 1500);
      }),
    ]);
    return { ok: true, type: 'remote_cli', latency: Date.now() - start };
  } catch {
    return null;
  } finally {
    if (timeout) {
      clearTimeout(timeout);
    }
  }
}
