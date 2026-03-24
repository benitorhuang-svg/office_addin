import { CopilotClient, CopilotClientOptions } from "@github/copilot-sdk";
import { ACPConnectionMethod } from '../atoms/types.js';
import { CORE_SDK_CONFIG } from '../atoms/core-config.js';

/**
 * Modern Client Manager with Connection Pooling and Health Monitoring.
 * Uses adaptive shim for Gemini CLI when running on Windows to bridge 
 * protocol and command-line compatibility gaps.
 */
class ClientManager {
  private static clients = new Map<string, {
    client: CopilotClient;
    method: ACPConnectionMethod;
    created: number;
    lastUsed: number;
    healthy: boolean;
  }>();

  private static pendingClients = new Map<string, Promise<CopilotClient>>();

  private static readonly CLIENT_TTL = 30 * 60 * 1000; // 30 minutes
  private static readonly HEALTH_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes
  private static healthCheckTimer?: NodeJS.Timeout;

  /**
   * Get or create a client with connection pooling
   */
  public static async getClient(
    method: ACPConnectionMethod,
    options: CopilotClientOptions
  ): Promise<CopilotClient> {
    const clientKey = `${method}-${JSON.stringify(options)}`;
    const _now = Date.now();

    /* Disable caching for debug
    const existing = this.clients.get(clientKey);
    if (existing && existing.healthy && (now - existing.created) < this.CLIENT_TTL) {
      existing.lastUsed = now;
      return existing.client;
    }
    */

    // Check if a client is already being created for this key
    const pendingPromise = this.pendingClients.get(clientKey);
    if (pendingPromise) {
      console.log(`[Client Manager] Waiting for pending creation: ${method}`);
      return pendingPromise;
    }

    /* Clean up old client if exists
    if (existing) {
      await this.cleanupClient(clientKey);
    }
    */

    // Create a new promise for the client creation
    const createClientPromise = (async () => {
      try {
        console.log(`[Client Manager] Starting new ${method} instance (Adaptive Mode)`);
        const startTimeoutMs = method === 'gemini_cli'
          ? CORE_SDK_CONFIG.GEMINI_CLIENT_START_TIMEOUT_MS
          : CORE_SDK_CONFIG.CLIENT_START_TIMEOUT_MS;
        
        // standard SDK client instantiation
        const client = new CopilotClient(options);

        // Add a safety timeout to prevent permanent server hangs during handshake.
        await Promise.race([
          client.start(),
          new Promise((_, reject) => setTimeout(
            () => reject(new Error(`ACP Client Timeout (${method}): Agent failed to start/handshake within ${Math.round(startTimeoutMs / 1000)}s`)),
            startTimeoutMs
          ))
        ]);

        // Store client info
        this.clients.set(clientKey, {
          client,
          method,
          created: Date.now(),
          lastUsed: Date.now(),
          healthy: true
        });

        if (!this.healthCheckTimer) {
          this.startHealthMonitoring();
        }

        return client;
      } catch (error) {
        console.error(`[Client Manager] Failed to start ${method}:`, error);
        throw error;
      } finally {
        this.pendingClients.delete(clientKey);
      }
    })();

    this.pendingClients.set(clientKey, createClientPromise);
    return createClientPromise;
  }

  private static startHealthMonitoring(): void {
    this.healthCheckTimer = setInterval(async () => {
      await this.performHealthCheck();
    }, this.HEALTH_CHECK_INTERVAL);
  }

  private static async performHealthCheck(): Promise<void> {
    const now = Date.now();
    const clientsToRemove: string[] = [];

    for (const [key, clientInfo] of this.clients.entries()) {
      if ((now - clientInfo.created) > this.CLIENT_TTL) {
        clientsToRemove.push(key);
        continue;
      }

      try {
        await clientInfo.client.ping();
        clientInfo.healthy = true;
      } catch (error) {
        console.warn(`[Client Manager] Health check failed for ${key}:`, error);
        clientInfo.healthy = false;
        if ((now - clientInfo.lastUsed) > 60000) {
          clientsToRemove.push(key);
        }
      }
    }

    for (const key of clientsToRemove) {
      await this.cleanupClient(key);
    }
  }

  public static async cleanupClient(key: string): Promise<void> {
    const clientInfo = this.clients.get(key);
    if (clientInfo) {
      try {
        await clientInfo.client.stop();
      } catch (error) {
        console.warn(`[Client Manager] Stop error for ${key}:`, error);
      }
      this.clients.delete(key);
    }
  }

  public static async cleanupAll(): Promise<void> {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = undefined;
    }
    const promises = Array.from(this.clients.keys()).map(k => this.cleanupClient(k));
    await Promise.allSettled(promises);
  }
}

/**
 * Functional exports for SDK Provider parity
 */
export const getOrCreateClient = ClientManager.getClient.bind(ClientManager);
export const stopAllClients = ClientManager.cleanupAll.bind(ClientManager);
export { ClientManager };
