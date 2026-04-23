import { stopAllClients } from '../../services/copilot/organisms/sdk-provider.js';
import type { Server as HttpServer } from 'node:http';
import type { Server as HttpsServer } from 'node:https';

type ManagedServer = HttpServer | HttpsServer;

/**
 * Molecule: Lifecycle Manager
 * Centralized registry for graceful shutdown handlers.
 * Consolidates SignalGuardian and ServerCleanup into a unified pattern.
 */
export class LifecycleManager {
  private static shutdownHandlers: (() => Promise<void>)[] = [];
  private static isShuttingDown = false;
  private static registered = false;

  public static onShutdown(handler: () => Promise<void>) {
    this.shutdownHandlers.push(handler);
    this.ensureSignalsRegistered();
  }

  public static registerServer(server: ManagedServer) {
    this.onShutdown(async () => {
      await new Promise<void>((resolve) => {
        server.close(() => {
          console.log('[Lifecycle] Server closed.');
          resolve();
        });
      });
    });
  }

  private static ensureSignalsRegistered() {
    if (this.registered) return;
    this.registered = true;

    const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];
    signals.forEach(sig => {
      process.once(sig, async () => {
        if (this.isShuttingDown) return;
        this.isShuttingDown = true;
        
        console.log(`\n[Lifecycle] ${sig} received. Commencing unified cleanup...`);
        
        for (const handler of this.shutdownHandlers) {
          try {
            await handler();
          } catch (err) {
            console.error('[Lifecycle] Cleanup handler failed:', err);
          }
        }
        
        console.log('[Lifecycle] Cleanup complete. Exiting.');
        process.exit(0);
      });
    });
  }
}

// Default system cleanup logic
LifecycleManager.onShutdown(async () => {
  try {
    const { ModernSDKOrchestrator } = await import('../../services/copilot/organisms/sdk-orchestrator-v2.js');
    await ModernSDKOrchestrator.cleanup();
  } catch (err) {
    console.warn('[Lifecycle] SDK cleanup failed:', err);
  }
});

LifecycleManager.onShutdown(async () => {
  await stopAllClients();
});
