import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import authRouter from '../routes/organisms/auth-router.js';
import apiRouter from '../routes/organisms/api-router.js';
import { createRateLimiter } from '../routes/molecules/rate-limiter.js';

/**
 * Molecule: Express App Factory
 * Orchestrates middleware and route registration.
 */
export const AppFactory = {
  create() {
    const app = express();
    
    // Request Logging (First!)
    app.use((req, res, next) => {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
      next();
    });

    app.use(cors({ origin: true, credentials: true }));
    app.use(bodyParser.json());

    // Health
    app.get('/', (req, res) => {
      res.json({ ok: true, version: 'Atomic-1.0', engine: 'Native Node' });
    });

    // Rate limiting on AI endpoints
    app.use('/api/copilot', createRateLimiter());

    // Mount Routes
    app.use('/auth', authRouter);
    app.use('/api', apiRouter);

    return app;
  }
};
