/**
 * Molecule: Rate Limiter
 * Sliding window per-IP rate limiting Express middleware.
 */

import type { Request, Response, NextFunction } from 'express';
import { logger } from '@shared/logger/index.js';
import { getClientIp } from '@infra/atoms/client-ip.js';

interface WindowEntry {
  timestamps: number[];
  lastSeen: number;
}

const store = new Map<string, WindowEntry>();

const WINDOW_MS = 60_000; // 1 minute
const CLEANUP_INTERVAL_MS = 5 * 60_000; // 5 minutes

// Periodically clean up expired entries to prevent memory leak
const cleanupTimer = setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of store) {
    if (entry.timestamps.length === 0 || now - entry.lastSeen > WINDOW_MS * 2) {
      store.delete(ip);
    }
  }
}, CLEANUP_INTERVAL_MS);
cleanupTimer.unref();

export function createRateLimiter(maxRequests?: number) {
  const configuredLimit = maxRequests ?? Number(process.env.RATE_LIMIT_RPM || '30');
  const limit = Number.isFinite(configuredLimit) && configuredLimit > 0 ? configuredLimit : 30;
  const enabled = process.env.RATE_LIMIT_ENABLED !== 'false';

  return (req: Request, res: Response, next: NextFunction): void => {
    if (!enabled) { next(); return; }

    const ip = getClientIp(req);
    const now = Date.now();
    const windowStart = now - WINDOW_MS;
    const entry = store.get(ip) ?? { timestamps: [], lastSeen: now };
    entry.timestamps = entry.timestamps.filter((timestamp) => timestamp > windowStart);
    entry.lastSeen = now;

    const resetAt = entry.timestamps.length > 0 ? entry.timestamps[0] + WINDOW_MS : now + WINDOW_MS;
    const remaining = Math.max(limit - entry.timestamps.length, 0);

    res.setHeader('RateLimit-Limit', String(limit));
    res.setHeader('RateLimit-Remaining', String(remaining));
    res.setHeader('RateLimit-Reset', String(Math.ceil(resetAt / 1000)));

    if (entry.timestamps.length >= limit) {
      const retryAfter = Math.max(1, Math.ceil((resetAt - now) / 1000));
      res.setHeader('Retry-After', String(retryAfter));
      logger.warn('RateLimiter', 'Request throttled', { ip, limit, retryAfter });
      res.status(429).json({
        error: 'rate_limit_exceeded',
        detail: `Too many requests. Limit: ${limit}/min. Retry after ${retryAfter}s.`,
      });
      return;
    }

    entry.timestamps.push(now);
    store.set(ip, entry);
    next();
  };
}
