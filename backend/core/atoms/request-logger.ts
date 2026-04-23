/**
 * Atom: Request Logger
 * Structured JSON logging for AI completion requests.
 */

import type { Request } from 'express';
import crypto from 'node:crypto';
import { getClientIp } from './client-ip.js';
import { logger } from './logger.js';

export interface RequestLog {
  requestId: string;
  timestamp: string;
  endpoint: string;
  authProvider: string;
  model: string;
  ip: string;
  streaming: boolean;
  userAgent: string;
}

export function createRequestLog(req: Request, requestId: string = crypto.randomUUID()): RequestLog {
  const ip = getClientIp(req);

  return {
    requestId,
    timestamp: new Date().toISOString(),
    endpoint: req.originalUrl || req.path || '/api/copilot',
    authProvider: req.body?.authProvider || 'unknown',
    model: req.body?.model || 'default',
    ip,
    streaming: !!req.body?.stream,
    userAgent: req.get('user-agent') || 'unknown',
  };
}

export function logCompletion(
  log: RequestLog,
  result: { latencyMs: number; status: 'ok' | 'error'; chunks?: number; error?: string }
): void {
  const entry = {
    ...log,
    latencyMs: result.latencyMs,
    status: result.status,
    ...(result.chunks !== undefined && { chunks: result.chunks }),
    ...(result.error && { error: result.error }),
  };

  logger.info('Request', 'Completion finished', entry);
}
