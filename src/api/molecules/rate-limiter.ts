/**
 * Molecule: Rate Limiter
 * Sliding window per-IP rate limiting Express middleware.
 * P4: Optimized to prevent OOM by performing time-windowed eviction on every insert.
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
const MAX_STALE_MS = 120_000; // 2 minutes

/**
 * P4: Evict stale entries to prevent OOM.
 */
function evictStale(now: number) {
  for (const [ip, entry] of store) {
    if (now - entry.lastSeen > MAX_STALE_MS) {
      store.delete(ip);
    }
  }
}

export function createRateLimiter(maxRequests?: number) {
  const configuredLimit = maxRequests ?? Number(process.env.RATE_LIMIT_RPM || '30');
  const limit = Number.isFinite(configuredLimit) && configuredLimit > 0 ? configuredLimit : 30;
  const enabled = process.env.RATE_LIMIT_ENABLED !== 'false';

  return (req: Request, res: Response, next: NextFunction): void => {
    if (!enabled) { next(); return; }

    // VALIDATE IP SOURCE: Ensure valid IPv4/IPv6 string
    const rawIp = getClientIp(req);
    if (!rawIp || typeof rawIp !== 'string' || (!rawIp.includes('.') && !rawIp.includes(':'))) {
      res.status(403).json({ error: 'invalid_ip_origin' });
      return;
    }
    const ip = rawIp;

    const now = Date.now();
    const windowStart = now - WINDOW_MS;

    // P4: Selective eviction on every request
    if (store.size > 1000) evictStale(now);

    const entry = store.get(ip) ?? { timestamps: [], lastSeen: now };
    
    // Optimized: Only filter until first valid timestamp is found instead of mapping all
    let firstValidIdx = 0;
    while (firstValidIdx < entry.timestamps.length && entry.timestamps[firstValidIdx] <= windowStart) {
      firstValidIdx++;
    }
    if (firstValidIdx > 0) {
      entry.timestamps = entry.timestamps.slice(firstValidIdx);
    }
    
    entry.lastSeen = now;

    if (entry.timestamps.length >= limit) {
      const resetAt = entry.timestamps[0] + WINDOW_MS;
      const retryAfter = Math.max(1, Math.ceil((resetAt - now) / 1000));
      res.setHeader('RateLimit-Limit', String(limit));
      res.setHeader('RateLimit-Remaining', '0');
      res.setHeader('RateLimit-Reset', String(Math.ceil(resetAt / 1000)));
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
    
    const remaining = Math.max(limit - entry.timestamps.length, 0);
    res.setHeader('RateLimit-Limit', String(limit));
    res.setHeader('RateLimit-Remaining', String(remaining));
    next();
  };
}
