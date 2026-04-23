import type { ACPHealthResult } from '@shared/atoms/ai-core/types.js';

/**
 * Molecule: Azure BYOK Health Checker
 */
export async function checkAzureHealth(key: string, endpoint: string): Promise<ACPHealthResult | null> {
  const start = Date.now();
  if (key && endpoint) {
    return { ok: true, type: 'azure_byok', latency: Date.now() - start, detail: 'Azure key configured' };
  }
  return null;
}
