/**
 * Molecule: Rate Limiter
 * Sliding window per-IP rate limiting Express middleware.
 * Wave 1: Defensive Foundation - Customizable windows & OOM protection.
 */

import type { Request, Response, NextFunction } from "express";
import { logger } from "@shared/logger/index.js";
import { getClientIp } from "@infra/atoms/client-ip.js";

interface WindowEntry {
  timestamps: number[];
  lastSeen: number;
}

const stores = new Map<string, Map<string, WindowEntry>>();

/**
 * Evict stale entries to prevent OOM.
 */
function evictStale(store: Map<string, WindowEntry>, now: number, maxStaleMs: number) {
  for (const [ip, entry] of store) {
    if (now - entry.lastSeen > maxStaleMs) {
      store.delete(ip);
    }
  }
}

export function createRateLimiter(
  maxRequests?: number,
  windowMs: number = 60_000,
  name: string = "default"
) {
  const limit = maxRequests ?? Number(process.env.RATE_LIMIT_RPM || "30");
  const enabled = process.env.RATE_LIMIT_ENABLED !== "false";
  const MAX_STALE_MS = windowMs * 2;

  if (!stores.has(name)) {
    stores.set(name, new Map<string, WindowEntry>());
  }
  const store = stores.get(name)!;

  return (req: Request, res: Response, next: NextFunction): void => {
    if (!enabled) {
      next();
      return;
    }

    const rawIp = getClientIp(req);
    if (!rawIp || typeof rawIp !== "string" || (!rawIp.includes(".") && !rawIp.includes(":"))) {
      res.status(403).json({ error: "invalid_ip_origin" });
      return;
    }
    const ip = rawIp;

    const now = Date.now();
    const windowStart = now - windowMs;

    // Preventive eviction if store grows too large
    if (store.size > 2000) evictStale(store, now, MAX_STALE_MS);

    const entry = store.get(ip) ?? { timestamps: [], lastSeen: now };

    // Filter out timestamps outside the current window
    entry.timestamps = entry.timestamps.filter((ts) => ts > windowStart);
    entry.lastSeen = now;

    if (entry.timestamps.length >= limit) {
      const first = entry.timestamps[0];
      const resetAt = (first ?? now) + windowMs;
      const retryAfter = Math.max(1, Math.ceil((resetAt - now) / 1000));
      res.setHeader("RateLimit-Limit", String(limit));
      res.setHeader("RateLimit-Remaining", "0");
      res.setHeader("RateLimit-Reset", String(Math.ceil(resetAt / 1000)));
      res.setHeader("Retry-After", String(retryAfter));

      logger.warn("RateLimiter", `Throttled [${name}]`, { ip, limit, retryAfter });
      res.status(429).json({
        error: "rate_limit_exceeded",
        detail: `Too many requests for ${name}. Limit: ${limit} per ${windowMs / 1000}s. Retry after ${retryAfter}s.`,
      });
      return;
    }

    entry.timestamps.push(now);
    store.set(ip, entry);

    const remaining = Math.max(limit - entry.timestamps.length, 0);
    res.setHeader("RateLimit-Limit", String(limit));
    res.setHeader("RateLimit-Remaining", String(remaining));
    next();
  };
}
