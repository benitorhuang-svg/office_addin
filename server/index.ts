import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import http from 'node:http';
import https from 'node:https';

// office-addin-dev-certs has no proper TS types/default export
// eslint-disable-next-line @typescript-eslint/no-require-imports
const devCerts = require('office-addin-dev-certs');

import config from './config/env.js';
import authRouter from './routes/auth.js';
import apiRouter from './routes/api.js';

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(bodyParser.json());

// Request logging middleware
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/', (_req: Request, res: Response) => {
  res.json({ ok: true, message: 'office_Agent server is running with Atomic Design Architecture (TS)' });
});

// Routes
app.use('/auth', authRouter);
app.use('/api', apiRouter);

// Start server
async function startServer(): Promise<void> {
  let options: https.ServerOptions = {};
  let isHttps = true;

  try {
    const certs = await devCerts.getHttpsServerOptions();
    options = { ca: certs.ca, key: certs.key, cert: certs.cert };
    console.log('[Setup] Successfully loaded dev certificates for HTTPS');
  } catch (err: any) {
    console.warn('[Setup] Failed to load dev certificates, falling back to HTTP', err.message);
    isHttps = false;
  }

  const preferredPorts = Array.from(new Set([config.PORT, 4000, 4001, 4002].filter(Boolean) as number[]));

  for (const port of preferredPorts) {
    try {
      const server = isHttps ? https.createServer(options, app) : http.createServer(app);
      await new Promise<void>((resolve, reject) => {
        const onError = (err: any) => {
          server.removeListener('listening', resolve);
          reject(err);
        };
        server.once('error', onError);
        server.once('listening', () => {
          server.removeListener('error', onError);
          resolve();
        });
        server.listen(port);
      });
      console.log(`[Setup] office_Agent server listening on ${isHttps ? 'https' : 'http'}://localhost:${port}`);
      return;
    } catch (err: any) {
      if (err && err.code === 'EADDRINUSE') {
        console.warn(`[Setup] Port ${port} is in use, trying next candidate`);
        continue;
      }
      throw err;
    }
  }

  throw new Error(`Unable to start server on any candidate port: ${preferredPorts.join(', ')}`);
}

startServer().catch(err => {
  console.error('[Critical] Server startup failed:', err);
  process.exit(1);
});
