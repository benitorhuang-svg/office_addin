/**
 * Atom: Structured Logger
 * Provides consistent JSON logging with basic secret redaction.
 * Supports requestId (HTTP request correlation) and traceId (cross-service chain tracing).
 */

export type LogLevel = 'info' | 'warn' | 'error';

const REDACTED_KEYS = /token|api[_-]?key|authorization|bearer|password|secret/i;

function sanitizeValue(value: unknown, seen = new WeakSet<object>()): unknown {
  if (value === null || value === undefined) {
    return value;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === 'bigint') {
    return value.toString();
  }

  if (value instanceof Error) {
    const errorShape: Record<string, unknown> = {
      name: value.name,
      message: value.message,
      stack: value.stack,
    };

    if ('cause' in value && value.cause !== undefined) {
      errorShape.cause = sanitizeValue(value.cause, seen);
    }

    return errorShape;
  }

  if (typeof value !== 'object') {
    return value;
  }

  if (seen.has(value)) {
    return '[Circular]';
  }

  seen.add(value);

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item, seen));
  }

  const output: Record<string, unknown> = {};
  for (const [key, entry] of Object.entries(value)) {
    output[key] = REDACTED_KEYS.test(key) ? '[REDACTED]' : sanitizeValue(entry, seen);
  }

  return output;
}

function writeLog(
  level: LogLevel,
  tag: string,
  message: string,
  data?: unknown,
  requestId?: string,
  traceId?: string,
): void {
  const entry: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    level,
    tag,
    message,
  };

  if (requestId) {
    entry.requestId = requestId;
  }

  if (traceId) {
    entry.traceId = traceId;
  }

  if (data !== undefined) {
    entry.data = sanitizeValue(data);
  }

  const line = JSON.stringify(entry);
  switch (level) {
    case 'warn':
      console.warn(line);
      break;
    case 'error':
      console.error(line);
      break;
    default:
      console.log(line);
      break;
  }
}

export const logger = {
  info: (tag: string, message: string, data?: unknown) => writeLog('info', tag, message, data),
  warn: (tag: string, message: string, data?: unknown) => writeLog('warn', tag, message, data),
  error: (tag: string, message: string, data?: unknown) => writeLog('error', tag, message, data),

  /**
   * Returns a request-scoped logger that automatically includes requestId in every entry.
   * Usage: const log = logger.withReqId(req.requestId);
   */
  withReqId: (requestId: string) => ({
    info:  (tag: string, message: string, data?: unknown) => writeLog('info',  tag, message, data, requestId),
    warn:  (tag: string, message: string, data?: unknown) => writeLog('warn',  tag, message, data, requestId),
    error: (tag: string, message: string, data?: unknown) => writeLog('error', tag, message, data, requestId),
    /** Attach a traceId to this request-scoped logger for cross-service chain tracing. */
    withTrace: (traceId: string) => ({
      info:  (tag: string, message: string, data?: unknown) => writeLog('info',  tag, message, data, requestId, traceId),
      warn:  (tag: string, message: string, data?: unknown) => writeLog('warn',  tag, message, data, requestId, traceId),
      error: (tag: string, message: string, data?: unknown) => writeLog('error', tag, message, data, requestId, traceId),
    }),
  }),

  /**
   * Returns a trace-scoped logger (cross-service chain; no specific HTTP request).
   * Usage: const log = logger.withTrace(traceId);
   */
  withTrace: (traceId: string) => ({
    info:  (tag: string, message: string, data?: unknown) => writeLog('info',  tag, message, data, undefined, traceId),
    warn:  (tag: string, message: string, data?: unknown) => writeLog('warn',  tag, message, data, undefined, traceId),
    error: (tag: string, message: string, data?: unknown) => writeLog('error', tag, message, data, undefined, traceId),
  }),
};

/** Convenience type for request-scoped loggers returned by logger.withReqId(). */
export type ScopedLogger = ReturnType<typeof logger.withReqId>;

/** Convenience type for trace-scoped loggers (cross-service propagation). */
export type TraceLogger = ReturnType<typeof logger.withTrace>;

