import http from 'node:http';
import https from 'node:https';

import config from '@config/molecules/server-config.js';
import { warmUpClient, stopAllClients, cleanupAllSessions } from '@shared/molecules/ai-core/client-manager.js';
import { AppFactory } from '@infra/molecules/app-factory.js';
import { resolveHttpsServerOptions } from '@infra/molecules/https-server-options.js';
import { LifecycleManager } from '@infra/molecules/lifecycle-manager.js';
import { markStart, markEnd } from '@infra/atoms/latency-tracker.js';
import { IdleCleaner } from '@shared/molecules/ai-core/idle-cleaner.js';
import { NexusSocketRelay } from '@infra/services/molecules/nexus-socket.js';
import { logger } from '@shared/logger/index.js';

/**
 * Organism: Enhanced Server Orchestrator
 * High-level service that manages the full server lifecycle with modern cleanup.
 */
export const ServerOrchestrator = {
  async start() {
    markStart('server-startup');

    // Register log hook for real-time monitoring
    logger.setHook((entry) => {
      NexusSocketRelay.broadcast('LOG_ENTRY', entry);
    });

    const app = AppFactory.create();

    const { isHttps, options } = await resolveHttpsServerOptions();
    const targetPort = Number(config.PORT) || 4000;
    
    try {
      const server = isHttps ? https.createServer(options, app) : http.createServer(app);
      
      await new Promise<void>((resolve, reject) => {
        server.once('error', (error: { code: string }) => {
          if (error.code === 'EADDRINUSE') reject(error);
          else throw error;
        });
        server.listen(targetPort, () => resolve());
      });
      
      console.log(`[Setup] Server: ${isHttps ? 'https' : 'http'}://localhost:${targetPort}`);
      markEnd('server-startup');

      NexusSocketRelay.attach(server);
      LifecycleManager.registerServer(server);

      if (config.AUTO_CONNECT_CLI && !config.isRemoteCliConfigured()) {
        setImmediate(() => {
          void warmUpClient('copilot_cli');
        });
      }

      // Start background tasks
      IdleCleaner.startScanning(async (_key) => {
        await cleanupAllSessions(); 
        await stopAllClients();
      });
      
      return server;
    } catch (error: unknown) {
      console.error('[Setup] Server failed to start:', error);
      throw error;
    }
  }
};
