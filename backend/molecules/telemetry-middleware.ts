import type { Request, Response, NextFunction } from 'express';
import crypto from 'node:crypto';
import { markStart, markEnd } from '../atoms/latency-tracker.js';
import { NexusSocketRelay } from '../services/molecules/nexus-socket.js';

/**
 * Middleware: Telemetry Guardian
 * Automatically tracks and broadcasts performance metrics for every API call.
 */
export function telemetryMiddleware(req: Request, res: Response, next: NextFunction) {
  const requestId = crypto.randomUUID();
  (res.locals as { requestId?: string }).requestId = requestId;
  res.setHeader('X-Request-Id', requestId);

  const label = `api-${req.method}-${req.path.replace(/\//g, '-')}-${requestId}`;
  markStart(label);

  let finalized = false;
  const finalize = () => {
    if (finalized) return;
    finalized = true;
    const ms = markEnd(label);
    if (ms !== -1) {
      NexusSocketRelay.broadcast('TELEMETRY_LATENCY', { 
        ms,
        endpoint: req.originalUrl || req.path,
        method: req.method,
        status: res.statusCode,
        requestId,
        phase: 'http',
      });
    }
  };

  res.once('finish', finalize);
  res.once('close', finalize);

  next();
}
