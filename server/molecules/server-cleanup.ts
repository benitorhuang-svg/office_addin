import http from 'node:http';
import https from 'node:https';

type ManagedServer = http.Server | https.Server;

let cleanupPromise: Promise<void> | null = null;

async function runSdkCleanup(): Promise<void> {
  try {
    const { ModernSDKOrchestrator } = await import('../services/copilot/organisms/sdk-orchestrator-v2.js');
    await ModernSDKOrchestrator.cleanup();
  } catch (error) {
    console.warn('[Setup] Error during SDK cleanup:', error);
  }
}

async function closeServer(server: ManagedServer): Promise<void> {
  await new Promise<void>((resolve) => {
    server.close(() => {
      console.log('[Setup] Server closed');
      resolve();
    });
  });
}

export function registerServerCleanup(server: ManagedServer): void {
  const cleanup = async () => {
    if (cleanupPromise) {
      await cleanupPromise;
      return;
    }

    cleanupPromise = (async () => {
      console.log('[Setup] Performing server cleanup...');
      await runSdkCleanup();
      await closeServer(server);
      process.exit(0);
    })();

    await cleanupPromise;
  };

  process.once('SIGTERM', () => {
    void cleanup();
  });
  process.once('SIGINT', () => {
    void cleanup();
  });
}