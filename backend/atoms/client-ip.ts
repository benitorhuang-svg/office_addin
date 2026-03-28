import { Request } from 'express';

/**
 * Atom: Client IP Extractor
 * Unified logic to safely extract client IP considering proxies and direct connections.
 */
export function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') return forwarded.split(',')[0].trim();
  return req.ip || req.socket.remoteAddress || 'unknown';
}
