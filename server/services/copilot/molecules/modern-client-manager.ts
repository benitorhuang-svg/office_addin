import { CopilotClient, CopilotClientOptions } from "@github/copilot-sdk";
import { ACPConnectionMethod } from '../atoms/types.js';

/**
 * Modern Client Manager with Connection Pooling and Health Monitoring
 * Based on GitHub Copilot SDK 0.2.0+ best practices
 */
export class ModernClientManager {
  private static clients = new Map<string, {
    client: CopilotClient;
    method: ACPConnectionMethod;
    created: number;
    lastUsed: number;
    healthy: boolean;
  }>();

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
    const now = Date.now();

    // Check if we have a healthy, non-expired client
    const existing = this.clients.get(clientKey);
    if (existing && existing.healthy && (now - existing.created) < this.CLIENT_TTL) {
      existing.lastUsed = now;
      return existing.client;
    }

    // Clean up old client if exists
    if (existing) {
      await this.cleanupClient(clientKey);
    }

    // Create new client
    console.log(`[Modern Client] Creating new client for ${method}`);
    const client = new CopilotClient(options);

    // Test the client
    try {
      await client.ping();
    } catch (error) {
      console.error(`[Modern Client] Failed to ping new client:`, error);
      throw error;
    }

    // Store client info
    this.clients.set(clientKey, {
      client,
      method,
      created: now,
      lastUsed: now,
      healthy: true
    });

    // Start health monitoring if not already running
    this.startHealthMonitoring();

    return client;
  }

  /**
   * Start periodic health monitoring
   */
  private static startHealthMonitoring(): void {
    if (this.healthCheckTimer) return;

    this.healthCheckTimer = setInterval(async () => {
      await this.performHealthCheck();
    }, this.HEALTH_CHECK_INTERVAL);
  }

  /**
   * Perform health check on all clients
   */
  private static async performHealthCheck(): Promise<void> {
    const now = Date.now();
    const clientsToRemove: string[] = [];

    for (const [key, clientInfo] of this.clients.entries()) {
      // Remove expired clients
      if ((now - clientInfo.created) > this.CLIENT_TTL) {
        clientsToRemove.push(key);
        continue;
      }

      // Health check active clients
      try {
        await clientInfo.client.ping();
        clientInfo.healthy = true;
      } catch (error) {
        console.warn(`[Modern Client] Health check failed for ${key}:`, error);
        clientInfo.healthy = false;
        
        // Remove unhealthy clients that haven't been used recently
        if ((now - clientInfo.lastUsed) > 60000) { // 1 minute
          clientsToRemove.push(key);
        }
      }
    }

    // Clean up expired/unhealthy clients
    for (const key of clientsToRemove) {
      await this.cleanupClient(key);
    }

    console.log(`[Modern Client] Health check completed. Active clients: ${this.clients.size}`);
  }

  /**
   * Clean up a specific client
   */
  private static async cleanupClient(key: string): Promise<void> {
    const clientInfo = this.clients.get(key);
    if (clientInfo) {
      try {
        await clientInfo.client.stop();
      } catch (error) {
        console.warn(`[Modern Client] Error stopping client ${key}:`, error);
      }
      this.clients.delete(key);
    }
  }

  /**
   * Get client statistics
   */
  public static getStats(): {
    totalClients: number;
    healthyClients: number;
    clientsByMethod: Record<string, number>;
  } {
    const stats = {
      totalClients: this.clients.size,
      healthyClients: 0,
      clientsByMethod: {} as Record<string, number>
    };

    for (const clientInfo of this.clients.values()) {
      if (clientInfo.healthy) {
        stats.healthyClients++;
      }
      
      stats.clientsByMethod[clientInfo.method] = 
        (stats.clientsByMethod[clientInfo.method] || 0) + 1;
    }

    return stats;
  }

  /**
   * Force cleanup of all clients
   */
  public static async cleanup(): Promise<void> {
    console.log('[Modern Client] Cleaning up all clients...');
    
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = undefined;
    }

    const cleanupPromises = Array.from(this.clients.keys()).map(key => 
      this.cleanupClient(key)
    );

    await Promise.allSettled(cleanupPromises);
    console.log('[Modern Client] Cleanup completed');
  }
}