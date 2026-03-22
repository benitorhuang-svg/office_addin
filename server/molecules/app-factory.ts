import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import authRouter from '../routes/auth.js';
import apiRouter from '../routes/api.js';

/**
 * Molecule: Express App Factory
 * Orchestrates middleware and route registration.
 */
export const AppFactory = {
  create() {
    const app = express();
    
    app.use(cors({ origin: true, credentials: true }));
    app.use(bodyParser.json());

    // Request Logging
    app.use((req, res, next) => {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
      next();
    });

    // Health
    app.get('/', (req, res) => {
      res.json({ ok: true, version: 'Atomic-1.0', engine: 'Native Node' });
    });

    // Mount Routes
    app.use('/auth', authRouter);
    app.use('/api', apiRouter);

    return app;
  }
};
