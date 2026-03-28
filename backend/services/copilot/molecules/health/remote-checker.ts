import { getOrCreateClient } from '../../molecules/client-manager.js';
import { ACPHealthResult } from '../../atoms/types.js';

/**
 * Molecule: Remote CLI Health Checker
 */
export async function checkRemoteHealth(port: string): Promise<ACPHealthResult | null> {
  const start = Date.now();
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 1500);

  try {
    const client = await getOrCreateClient('remote_cli', { 
      cliUrl: `localhost:${port}`,
      cliPath: 'copilot'
    });
    await client.ping('health');
    clearTimeout(id);
    return { ok: true, type: 'remote_cli', latency: Date.now() - start };
  } catch {
    clearTimeout(id);
    return null;
  }
}
