import http from 'node:http';
import https from 'node:https';

import config from '../config/molecules/server-config.js';
import { warmUpClient } from '../services/copilot/organisms/sdk-provider.js';
import { AppFactory } from '../molecules/app-factory.js';
import { resolveHttpsServerOptions } from '../molecules/https-server-options.js';
import { LifecycleManager } from '../molecules/lifecycle-manager.js';
import { markStart, markEnd } from '../atoms/latency-tracker.js';
import { IdleCleaner } from '../services/copilot/molecules/idle-cleaner.js';
import { stopAllClients, cleanupAllSessions } from '../services/copilot/organisms/sdk-provider.js';
import { NexusSocketRelay } from '../services/molecules/nexus-socket.js';

/**
 * Organism: Enhanced Server Orchestrator
 * High-level service that manages the full server lifecycle with modern cleanup.
 */
export const ServerOrchestrator = {
  async start() {
    markStart('server-startup');
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
