/**
 * Atom: Request Logger
 * Structured JSON logging for AI completion requests.
 */

import { Request } from 'express';
import crypto from 'node:crypto';
import { getClientIp } from './client-ip.js';

export interface RequestLog {
  requestId: string;
  timestamp: string;
  authProvider: string;
  model: string;
  ip: string;
  streaming: boolean;
}

export function createRequestLog(req: Request): RequestLog {
  const ip = getClientIp(req);

  return {
    requestId: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    authProvider: req.body?.authProvider || 'unknown',
    model: req.body?.model || 'default',
    ip,
    streaming: !!req.body?.stream,
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

  console.log(JSON.stringify(entry));
}
