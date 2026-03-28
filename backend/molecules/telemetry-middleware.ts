import { Request, Response, NextFunction } from 'express';
import { markStart, markEnd } from '../atoms/latency-tracker.js';
import { NexusSocketRelay } from '../services/molecules/nexus-socket.js';

/**
 * Middleware: Telemetry Guardian
 * Automatically tracks and broadcasts performance metrics for every API call.
 */
export function telemetryMiddleware(req: Request, res: Response, next: NextFunction) {
  const label = `api-${req.method}-${req.path.replace(/\//g, '-')}`;
  markStart(label);

  res.on('finish', () => {
    const ms = markEnd(label);
    if (ms !== -1) {
      NexusSocketRelay.broadcast('TELEMETRY_LATENCY', { 
        ms, 
        endpoint: req.path,
        method: req.method,
        status: res.statusCode 
      });
    }
  });

  next();
}
