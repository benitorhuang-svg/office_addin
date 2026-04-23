import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import authRouter from '@api/organisms/auth-router.js';
import apiRouter from '@api/organisms/api-router.js';
import config from '@config/env.js';
import { telemetryMiddleware } from '@infra/molecules/telemetry-middleware.js';

/**
 * Molecule: Express App Factory
 * Orchestrates middleware and route registration.
 */
export const AppFactory = {
  create() {
    const app = express();
    const distPath = path.resolve(process.cwd(), 'dist');
    const defaultOrigins = [
      'https://localhost:3000',
      'https://localhost:3001',
      'https://localhost:4000',
    ];
    const configuredOrigins = (process.env.CORS_ALLOWED_ORIGINS || '')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean);
    const allowedOrigins = new Set([...defaultOrigins, ...configuredOrigins]);
    const allowAllOrigins = process.env.CORS_ALLOW_ALL_ORIGINS === 'true';

    // 1. Logging & Telemetry
    app.use(telemetryMiddleware);

    // 1b. PR-008: Attach a unique request-id to every incoming request
    app.use((req, _res, next) => {
      (req as express.Request & { requestId: string }).requestId =
        (req.headers['x-request-id'] as string) || randomUUID();
      next();
    });

    // 2. Body Parser & CORS
    app.use(cors({ 
      origin: (origin, callback) => {
        if (!origin) {
          callback(null, true);
          return;
        }

        const isAllowed = allowAllOrigins
          || allowedOrigins.has(origin)
          || (origin && Array.isArray(config.CORS_ALLOWED_ORIGINS) 
              ? config.CORS_ALLOWED_ORIGINS.some((pattern: RegExp | string) => 
                  pattern instanceof RegExp ? pattern.test(origin) : pattern === origin
                ) 
              : false); 
        if (isAllowed) {
          callback(null, true);
        } else {
          callback(new Error(`CORS origin not allowed: ${origin}`), false);
        }
      }, 
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Gemini-Key', 'X-User-API-Key'],
      credentials: true 
    }));
    app.use(express.json({ limit: '1mb' }));
    app.use(express.static(distPath));

    // 3. Mount Slots
    app.use('/auth', authRouter);
    app.use('/api', apiRouter);

    // PR-003: Debug endpoint ??disabled by default in ALL environments.
    // Set EXPOSE_DEBUG_ENDPOINTS=true in .env to enable during local dev.
    app.get('/api/debug/list-models', async (req, res) => {
      if (process.env.EXPOSE_DEBUG_ENDPOINTS !== 'true') {
        res.status(403).json({ error: 'debug_endpoint_disabled' });
        return;
      }

      const key = (req.query.key as string) || (req.headers['x-gemini-key'] as string);
      if (!key) { res.status(400).json({ error: 'Missing key' }); return; }
      try {
        const fetch = (await import('node-fetch')).default || global.fetch;
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
        res.json(await response.json());
      } catch (e: unknown) {
        res.status(500).json({ error: e instanceof Error ? e.message : String(e) });
      }
    });

    app.get('/', (req, res) => {
      if (req.headers.accept?.includes('text/html')) {
        res.redirect('/monitor.html');
      } else {
        res.json({ ok: true });
      }
    });

    return app;
  }
};
