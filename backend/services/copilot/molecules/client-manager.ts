import { CopilotClient } from "@github/copilot-sdk";
import type { CopilotClientOptions } from "@github/copilot-sdk";
import type { ACPConnectionMethod } from '../atoms/types.js';
import { CORE_SDK_CONFIG } from '../atoms/core-config.js';
import { IdleCleaner } from './idle-cleaner.js';
import { logger } from '../../../core/atoms/logger.js';

// ---------------------------------------------------------------------------
// PR-004: Circuit Breaker types
// ---------------------------------------------------------------------------
type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

interface CircuitBreaker {
  state: CircuitState;
  failureCount: number;
  lastFailureTime: number;
}

const FAILURE_THRESHOLD = 5;
const RECOVERY_TIMEOUT_MS = 60_000; // 1 minute

/**
 * Modern Client Manager with Connection Pooling, Health Monitoring,
 * Concurrency Semaphore (PR-004), and Circuit Breaker (PR-004).
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

  // PR-004: Per-key circuit breakers
  private static circuitBreakers = new Map<string, CircuitBreaker>();

  // PR-004: Global concurrency semaphore — max 10 concurrent Copilot calls
  private static readonly MAX_CONCURRENT = 10;
  private static activeRequests = 0;
  private static semaphoreQueue: Array<() => void> = [];

  private static readonly CLIENT_TTL = 30 * 60 * 1000; // 30 minutes
  private static readonly HEALTH_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes
  private static healthCheckTimer?: NodeJS.Timeout;

  // ---------------------------------------------------------------------------
  // PR-004: Semaphore helpers
  // ---------------------------------------------------------------------------

  private static async acquireSemaphore(): Promise<void> {
    if (ClientManager.activeRequests < ClientManager.MAX_CONCURRENT) {
      ClientManager.activeRequests++;
      return;
    }
    return new Promise<void>((resolve) => {
      ClientManager.semaphoreQueue.push(resolve);
    });
  }

  private static releaseSemaphore(): void {
    const next = ClientManager.semaphoreQueue.shift();
    if (next) {
      next();
    } else {
      ClientManager.activeRequests = Math.max(0, ClientManager.activeRequests - 1);
    }
  }

  // ---------------------------------------------------------------------------
  // PR-004: Circuit breaker helpers
  // ---------------------------------------------------------------------------

  private static getBreaker(key: string): CircuitBreaker {
    if (!ClientManager.circuitBreakers.has(key)) {
      ClientManager.circuitBreakers.set(key, { state: 'CLOSED', failureCount: 0, lastFailureTime: 0 });
    }
    return ClientManager.circuitBreakers.get(key)!;
  }

  private static checkBreaker(key: string): void {
    const breaker = ClientManager.getBreaker(key);
    if (breaker.state === 'OPEN') {
      const elapsed = Date.now() - breaker.lastFailureTime;
      if (elapsed >= RECOVERY_TIMEOUT_MS) {
        breaker.state = 'HALF_OPEN';
        logger.info('ClientManager', 'Circuit HALF_OPEN — attempting recovery probe', { key });
      } else {
        throw new Error(`Circuit breaker OPEN for ${key}. Retry after ${Math.ceil((RECOVERY_TIMEOUT_MS - elapsed) / 1000)}s.`);
      }
    }
  }

  private static recordSuccess(key: string): void {
    const breaker = ClientManager.getBreaker(key);
    breaker.failureCount = 0;
    breaker.state = 'CLOSED';
  }

  private static recordFailure(key: string): void {
    const breaker = ClientManager.getBreaker(key);
    breaker.failureCount++;
    breaker.lastFailureTime = Date.now();
    if (breaker.state === 'HALF_OPEN' || breaker.failureCount >= FAILURE_THRESHOLD) {
      breaker.state = 'OPEN';
      logger.warn('ClientManager', 'Circuit OPEN — further requests blocked', {
        key,
        failureCount: breaker.failureCount,
      });
    }
  }

  // ---------------------------------------------------------------------------
  // Existing helpers
  // ---------------------------------------------------------------------------

  private static normalizeCacheKeyPart(value: unknown): unknown {
    if (Array.isArray(value)) {
      return value.map((item) => this.normalizeCacheKeyPart(item));
    }

    if (!value || typeof value !== 'object') {
      return typeof value === 'function' ? '[function]' : value;
    }

    return Object.keys(value as Record<string, unknown>)
      .sort()
      .reduce<Record<string, unknown>>((normalized, key) => {
        normalized[key] = this.normalizeCacheKeyPart((value as Record<string, unknown>)[key]);
        return normalized;
      }, {});
  }

  private static buildClientKey(method: ACPConnectionMethod, options: CopilotClientOptions): string {
    return `${method}-${JSON.stringify(this.normalizeCacheKeyPart(options))}`;
  }

  /**
   * Get or create a client with connection pooling, circuit breaker, and semaphore.
   */
  public static async getClient(
    method: ACPConnectionMethod,
    options: CopilotClientOptions
  ): Promise<CopilotClient> {
    const clientKey = this.buildClientKey(method, options);
    const now = Date.now();

    // PR-004: Fail fast if circuit is OPEN
    this.checkBreaker(clientKey);

    const existing = this.clients.get(clientKey);
    if (existing && existing.healthy && (now - existing.created) < this.CLIENT_TTL) {
      existing.lastUsed = now;
      IdleCleaner.touch(clientKey);
      this.recordSuccess(clientKey);
      return existing.client;
    }

    // Check if a client is already being created for this key
    const pendingPromise = this.pendingClients.get(clientKey);
    if (pendingPromise) {
      logger.info('ClientManager', 'Waiting for pending client creation', { method });
      return pendingPromise;
    }

    if (existing) {
      await this.cleanupClient(clientKey);
    }

    // Create a new promise for the client creation
    const createClientPromise = (async () => {
      let client: CopilotClient | undefined;
      let startTimer: ReturnType<typeof setTimeout> | undefined;

      // PR-004: Acquire semaphore slot before connecting
      await ClientManager.acquireSemaphore();

      try {
        logger.info('ClientManager', 'Starting new Copilot client', { method, clientKey });
        const startTimeoutMs = method === 'gemini_cli'
          ? CORE_SDK_CONFIG.GEMINI_CLIENT_START_TIMEOUT_MS
          : CORE_SDK_CONFIG.CLIENT_START_TIMEOUT_MS;
        
        // standard SDK client instantiation
        client = new CopilotClient(options);

        // Add a safety timeout to prevent permanent server hangs during handshake.
        const startPromise = client.start();
        const timeoutPromise = new Promise<never>((_, reject) => {
          startTimer = setTimeout(
            () => reject(new Error(`ACP Client Timeout (${method}): Agent failed to start/handshake within ${Math.round(startTimeoutMs / 1000)}s`)),
            startTimeoutMs
          );
        });

        await Promise.race([startPromise, timeoutPromise]);

        // Store client info
        this.clients.set(clientKey, {
          client,
          method,
          created: Date.now(),
          lastUsed: Date.now(),
          healthy: true
        });

        IdleCleaner.touch(clientKey);

        if (!this.healthCheckTimer) {
          this.startHealthMonitoring();
          IdleCleaner.startScanning((key) => this.cleanupClient(key));
        }

        // PR-004: Record success — reset circuit breaker
        ClientManager.recordSuccess(clientKey);

        return client;
      } catch (error) {
        if (client) {
          await client.stop().catch(() => undefined);
        }
        // PR-004: Record failure — may open circuit
        ClientManager.recordFailure(clientKey);
        logger.error('ClientManager', 'Failed to start Copilot client', { method, clientKey, error });
        throw error;
      } finally {
        if (startTimer) {
          clearTimeout(startTimer);
        }
        this.pendingClients.delete(clientKey);
        // PR-004: Always release semaphore slot
        ClientManager.releaseSemaphore();
      }
    })();

    this.pendingClients.set(clientKey, createClientPromise);
    return createClientPromise;
  }

  private static startHealthMonitoring(): void {
    this.healthCheckTimer = setInterval(async () => {
      await this.performHealthCheck();
    }, this.HEALTH_CHECK_INTERVAL);
    // Optimization: unref() prevents the timer from keeping the Node process alive
    this.healthCheckTimer.unref();
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
        this.recordSuccess(key);
      } catch (error) {
        logger.warn('ClientManager', 'Client health check failed', { key, method: clientInfo.method, error });
        clientInfo.healthy = false;
        this.recordFailure(key);
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
        logger.warn('ClientManager', 'Failed to stop Copilot client cleanly', {
          key,
          method: clientInfo.method,
          error,
        });
      }
      this.clients.delete(key);
      IdleCleaner.remove(key);
    }
  }

  public static async cleanupByParams(method: ACPConnectionMethod, options: CopilotClientOptions): Promise<void> {
    const key = this.buildClientKey(method, options);
    await this.cleanupClient(key);
  }

  public static async cleanupAll(): Promise<void> {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = undefined;
    }
    IdleCleaner.stopScanning();
    const promises = Array.from(this.clients.keys()).map(k => this.cleanupClient(k));
    await Promise.allSettled(promises);
  }
}

/**
 * Functional exports for SDK Provider parity
 */
export const getOrCreateClient = ClientManager.getClient.bind(ClientManager);
export const stopAllClients = ClientManager.cleanupAll.bind(ClientManager);
export const removeClientByParams = ClientManager.cleanupByParams.bind(ClientManager);
export const removeClient = ClientManager.cleanupClient.bind(ClientManager);
export { ClientManager };
