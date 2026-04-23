import type { Request } from 'express';

/**
 * Atom: Client IP Extractor
 * Unified logic to safely extract client IP considering proxies and direct connections.
 */
export function getClientIp(req: Request): string {
  // P4: If 'trust proxy' is configured in Express, req.ip will be the real client IP safely extracted.
  // Extracting from x-forwarded-for directly is insecure without strict proxy validation.
  return req.ip || req.socket.remoteAddress || 'unknown';
}
