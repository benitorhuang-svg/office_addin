import config from '../../../config/env.js';
import { ACPConnectionMethod, ACPHealthResult } from '../atoms/types.js';
import { resolveACPOptions } from '../molecules/option-resolver.js';
import { getOrCreateClient } from '../molecules/client-manager.js';

// Atomized Health Checkers
import { checkRemoteHealth } from '../molecules/health/remote-checker.js';
import { checkAzureHealth } from '../molecules/health/azure-checker.js';
import { checkCliBaselineHealth } from '../molecules/health/cli-checker.js';

/**
 * Organism: Warming up the specified CLI method by starting its process.
 */
export async function warmUpClient(method: ACPConnectionMethod) {
    try {
        console.log(`[ACP Prober] Warming up ${method}...`);
        const { clientOptions } = resolveACPOptions({ 
            method, model: '', streaming: false 
        });
        await getOrCreateClient(method, clientOptions);
        console.log(`[ACP Prober] ${method} is warmed up and ready.`);
    } catch (err) {
        console.warn(`[ACP Prober] Failed to warm up ${method}:`, err);
    }
}

/**
 * Organism: Probes the available ACP connection to report readiness.
 * Orchestrates multiple molecules in priority order.
 */
export async function checkAgentHealth(): Promise<ACPHealthResult> {
  // 1. Check remote CLI (Priority High)
  if (config.COPILOT_AGENT_PORT) {
    const remote = await checkRemoteHealth(config.COPILOT_AGENT_PORT);
    if (remote) return remote;
  }

  // 2. Check Azure BYOK 
  const azure = await checkAzureHealth(config.AZURE_OPENAI_API_KEY, config.AZURE_OPENAI_ENDPOINT);
  if (azure) return azure;

  // 3. Copilot CLI baseline test (Fallback)
  return await checkCliBaselineHealth();
}
