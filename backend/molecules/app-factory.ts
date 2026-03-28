import express from 'express';
import cors from 'cors';
import path from 'node:path';
import https from 'node:https';
import { fileURLToPath } from 'node:url';
import authRouter from '../routes/organisms/auth-router.js';
import apiRouter from '../routes/organisms/api-router.js';
import { createRateLimiter } from '../routes/molecules/rate-limiter.js';
import { telemetryMiddleware } from './telemetry-middleware.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Molecule: Express App Factory
 * Orchestrates middleware and route registration.
 */
export const AppFactory = {
  create() {
    const app = express();
    const distPath = path.resolve(__dirname, '../../dist');

    // 1. Request Logging & Telemetry (Essential for diagnostics)
    app.use((req, _res, next) => {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
      next();
    });
    app.use(telemetryMiddleware);

    // 2. Integrated Gateway Proxy (Development Mode: 4000 -> 3001)
    // This allows Port 4000 to serve live-updating frontend from WDS.
    if (process.env.NODE_ENV !== 'production') {
      app.use((req, res, next) => {
        const isFrontend = req.path.match(/\.(html|js|css|map|png|jpg|jpeg|ico|json|svg)$/) || req.path === '/';
        const isApi = req.path.startsWith('/api') || req.path.startsWith('/auth');

        if (isFrontend && !isApi) {
          const proxyOptions = {
            hostname: 'localhost',
            port: 3001,
            path: req.url,
            method: req.method,
            headers: { ...req.headers },
            rejectUnauthorized: false
          };
          delete proxyOptions.headers.host;

          const proxyReq = https.request(proxyOptions, (proxyRes) => {
            if (proxyRes.statusCode === 404) return next();
            res.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
            proxyRes.pipe(res);
          });
          
          proxyReq.on('error', (err: any) => {
            console.warn('[Gateway] Webpack Dev Server fallback to Static:', err.message);
            next();
          });
          
          req.pipe(proxyReq);
        } else {
          next();
        }
      });
    }

    // 3. Static Assets & CORS Management
    app.use(express.static(distPath));

    const ALLOWED_ORIGINS = [
      'https://localhost:3000', 
      'https://localhost:3001',
      'https://localhost:4000',
      /\.a\.run\.app$/ 
    ];
    app.use(cors({ 
      origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        if (!origin || ALLOWED_ORIGINS.some(pattern => 
          typeof pattern === 'string' ? pattern === origin : pattern.test(origin)
        )) {
          callback(null, true);
        } else {
          if (process.env.NODE_ENV === 'production') {
            callback(new Error('CORS: Origin not allowed'));
          } else {
            callback(null, true); 
          }
        }
      }, 
      credentials: true 
    }));
    app.use(express.json({ limit: '1mb' }));
    
    // Security Guard: Prevent MIME sniffing and XSS
    app.use((_req, res, next) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-XSS-Protection', '1; mode=block');
      
      // 🛡️ CRITICAL DEVELOPER FIX: Allow local private network preflight
      res.setHeader('Access-Control-Allow-Private-Network', 'true');
      
      // Allow Office to load the Add-in in a frame
      res.setHeader('Content-Security-Policy', "frame-ancestors 'self' https://*.office.com https://*.officeapps.live.com https://*.microsoft.com;");
      next();
    });

    // Health & Monitor Redirect
    app.get('/', (req, res) => {
      // If it's a browser, redirect to monitor. Else return json.
      const accept = req.headers.accept || '';
      if (accept.includes('text/html')) {
        res.redirect('/monitor.html');
      } else {
        res.json({ ok: true, version: 'Nexus-Docker-1.0', engine: 'Industrial Node' });
      }
    });

    // Rate limiting on AI endpoints
    app.use('/api/copilot', createRateLimiter());

    // Mount Routes
    app.use('/auth', authRouter);
    app.use('/api', apiRouter);

    return app;
  }
};
