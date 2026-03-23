import { CopilotClient, CopilotClientOptions } from "@github/copilot-sdk";
import { ACPConnectionMethod } from '../atoms/types.js';

// Global Client Cache for CLI-based methods (e.g., Gemini CLI)
const clientCache: Map<string, CopilotClient> = new Map();

/**
 * Molecule: Manages the lifecycle of a Copilot agent process.
 * Reuses existing processes for performance, but restarts them if dead.
 */
export async function getOrCreateClient(
  method: ACPConnectionMethod, 
  options: CopilotClientOptions
): Promise<CopilotClient> {
  const cacheKey = method;
  let client = clientCache.get(cacheKey);

  if (client) {
    try {
      console.log(`[ACP Manager] Health check for ${method}...`);
      await client.ping('health-check');
      console.log(`[ACP Manager] Health check for ${method} SUCCESS.`);
      return client;
    } catch {
      console.warn(`[ACP Manager] Cached client for ${method} is dead. Restarting...`);
      try { await client.stop(); } catch {}
      clientCache.delete(cacheKey);
    }
  }

  console.log(`[ACP Manager] Spawning new ${method} process...`);
  client = new CopilotClient(options);
  try {
    await client.start();
    console.log(`[ACP Manager] ${method} process STARTED successfully.`);
  } catch (err) {
    console.error(`[ACP Manager] ${method} process FAILED to start:`, err);
    throw err;
  }
  clientCache.set(cacheKey, client);
  return client;
}

/**
 * Molecule: Cleanly shutdown all background Copilot agents.
 */
export async function stopAllClients() {
  const methods = Array.from(clientCache.keys());
  for (const method of methods) {
    const client = clientCache.get(method);
    if (client) {
      console.log(`[ACP Manager] Stopping ${method} process...`);
      try {
        await client.stop();
      } catch (err) {
        console.error(`[ACP Manager] Error stopping ${method}:`, err);
      }
      clientCache.delete(method);
    }
  }
}
