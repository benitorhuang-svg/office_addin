import http from 'node:http';
import https from 'node:https';
import * as devCerts from 'office-addin-dev-certs';

import config from '../config/molecules/server-config.js';
import { warmUpClient } from '../services/copilot/organisms/sdk-provider.js';
import { AppFactory } from '../molecules/app-factory.js';
import { SignalGuardian } from '../molecules/signal-guardian.js';

/**
 * Organism: Enhanced Server Orchestrator
 * High-level service that manages the full server lifecycle with modern cleanup.
 */
export const ServerOrchestrator = {
  async start() {
    const app = AppFactory.create();
    SignalGuardian.register();

    let options: https.ServerOptions = {};
    let isHttps = true;

    try {
      const certs = await devCerts.getHttpsServerOptions();
      options = { ca: certs.ca, key: certs.key, cert: certs.cert };
      console.log('[Setup] SSL: Success');
    } catch (err: unknown) {
      console.warn('[Setup] SSL: Falling back to HTTP', err instanceof Error ? err.message : String(err));
      isHttps = false;
    }

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


        // Enhanced cleanup handling
        const cleanup = async () => {
          console.log('[Setup] Performing server cleanup...');
          try {
            const { ModernSDKOrchestrator } = await import('../services/copilot/organisms/sdk-orchestrator-v2.js');
            await ModernSDKOrchestrator.cleanup();
          } catch (error) {
            console.warn('[Setup] Error during SDK cleanup:', error);
          }
          
          server.close(() => {
            console.log('[Setup] Server closed');
            process.exit(0);
          });
        };

        process.on('SIGTERM', cleanup);
        process.on('SIGINT', cleanup);

        // Background Warmup
        process.nextTick(() => {
          warmUpClient('copilot_cli').catch(() => {});
        });
        
        return server;
    } catch (error: unknown) {

      console.error('[Setup] Server failed to start:', error);
      throw error;
    }
  }
};

