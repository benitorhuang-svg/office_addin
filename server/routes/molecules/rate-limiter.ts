/**
 * Molecule: Rate Limiter
 * Sliding window per-IP rate limiting Express middleware.
 */

import { Request, Response, NextFunction } from 'express';

interface WindowEntry {
  count: number;
  windowStart: number;
}

const store = new Map<string, WindowEntry>();

const WINDOW_MS = 60_000; // 1 minute
const CLEANUP_INTERVAL_MS = 5 * 60_000; // 5 minutes

// Periodically clean up expired entries to prevent memory leak
const cleanupTimer = setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of store) {
    if (now - entry.windowStart > WINDOW_MS * 2) {
      store.delete(ip);
    }
  }
}, CLEANUP_INTERVAL_MS);
cleanupTimer.unref();

import { getClientIp } from '../../atoms/client-ip.js';

export function createRateLimiter(maxRequests?: number) {
  const limit = maxRequests ?? Number(process.env.RATE_LIMIT_RPM || '30');
  const enabled = process.env.RATE_LIMIT_ENABLED !== 'false';

  return (req: Request, res: Response, next: NextFunction): void => {
    if (!enabled) { next(); return; }

    const ip = getClientIp(req);
    const now = Date.now();
    const entry = store.get(ip);

    if (!entry || now - entry.windowStart >= WINDOW_MS) {
      store.set(ip, { count: 1, windowStart: now });
      next();
      return;
    }

    entry.count++;

    if (entry.count > limit) {
      const retryAfter = Math.ceil((entry.windowStart + WINDOW_MS - now) / 1000);
      res.set('Retry-After', String(retryAfter));
      res.status(429).json({
        error: 'rate_limit_exceeded',
        detail: `Too many requests. Limit: ${limit}/min. Retry after ${retryAfter}s.`,
      });
      return;
    }

    next();
  };
}
