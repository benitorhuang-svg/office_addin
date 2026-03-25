import express from 'express';
import cors from 'cors';
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

    const ALLOWED_ORIGINS = ['https://localhost:3000'];
    app.use(cors({ 
      origin: (origin, callback) => {
        if (!origin || ALLOWED_ORIGINS.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      }, 
      credentials: true 
    }));
    app.use(express.json({ limit: '1mb' }));
    
    // Security Guard: Prevent MIME sniffing, clickjacking, and XSS
    app.use((req, res, next) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-XSS-Protection', '1; mode=block');
      next();
    });

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
