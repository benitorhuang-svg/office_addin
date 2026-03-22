import http from 'node:http';
import https from 'node:https';
import devCerts from 'office-addin-dev-certs';

import config from '../config/env.js';
import { warmUpClient } from '../services/copilot/sdkProvider.js';
import { AppFactory } from '../molecules/app-factory.js';
import { SignalGuardian } from '../molecules/signal-guardian.js';

/**
 * Organism: Server Orchestrator
 * High-level service that manages the full server lifecycle.
 * Combines App, SSL, Ports, and Signal management.
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
    } catch (_err) {
      console.warn('[Setup] SSL: Falling back to HTTP');
      isHttps = false;
    }

    const ports = Array.from(new Set([config.PORT, 4000, 4001, 4002].filter(Boolean) as number[]));

    for (const port of ports) {
      try {
        const server = isHttps ? https.createServer(options, app) : http.createServer(app);
        await new Promise<void>((resolve, reject) => {
          server.once('error', (error: { code: string }) => {
            if (error.code === 'EADDRINUSE') reject(error);
            else throw error;
          });
          server.listen(port, () => resolve());
        });
        
        console.log(`[Setup] Server: ${isHttps ? 'https' : 'http'}://localhost:${port}`);

        // Background Warmup
        process.nextTick(() => {
          warmUpClient('copilot_cli').catch(() => {});
          if (config.GEMINI_API_KEY) {
            warmUpClient('gemini_cli').catch(() => {});
          }
        });
        return server;
      } catch (error: unknown) {
        if ((error as { code: string }).code === 'EADDRINUSE') {
          console.warn(`[Setup] Port ${port} in use, skipping...`);
          continue;
        }
        throw error;
      }
    }
  }
};
