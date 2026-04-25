/**
 * Atom: Structured Logger
 * Provides consistent JSON logging with basic secret redaction.
 * Supports requestId (HTTP request correlation) and traceId (cross-service chain tracing).
 */

export type LogLevel = "info" | "warn" | "error";

const REDACTED_KEYS = /token|api[_-]?key|authorization|bearer|password|secret/i;
const MAX_DEPTH = 5;

function sanitizeValue(value: unknown, seen = new WeakSet<object>(), depth = 0): unknown {
  if (value === null || value === undefined || depth >= MAX_DEPTH) {
    return value;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === "bigint") {
    return value.toString();
  }

  if (value instanceof Error) {
    const errorShape: Record<string, unknown> = {
      name: value.name,
      message: value.message,
      stack: value.stack,
    };

    if ("cause" in value && value.cause !== undefined) {
      errorShape.cause = sanitizeValue(value.cause, seen, depth + 1);
    }

    return errorShape;
  }

  if (typeof value !== "object") {
    return value;
  }

  if (seen.has(value)) {
    return "[Circular]";
  }

  seen.add(value);

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item, seen, depth + 1));
  }

  const output: Record<string, unknown> = {};
  for (const [key, entry] of Object.entries(value)) {
    if (REDACTED_KEYS.test(key)) {
      output[key] = "[REDACTED]";
    } else if (
      typeof entry === "string" &&
      (REDACTED_KEYS.test(entry) || /^(ghu_|ghp_|gho_|github_pat_|eyJh|bearer\s)/i.test(entry))
    ) {
      output[key] = "[REDACTED_VALUE]";
    } else if (typeof entry === "string" && entry.length > 5000) {
      output[key] = entry.substring(0, 5000) + "...[TRUNCATED]";
    } else {
      output[key] = sanitizeValue(entry, seen, depth + 1);
    }
  }

  return output;
}

export type LogEntry = {
  timestamp: string;
  level: LogLevel;
  tag: string;
  message: string;
  requestId?: string;
  traceId?: string;
  data?: unknown;
  performance?: {
    durationMs?: number;
    memoryUsageMb?: number;
  };
};

type LogHook = (entry: LogEntry) => void;
let logHook: LogHook | null = null;

const timers = new Map<string, { startTime: number; startMemory: number }>();

function writeLog(
  level: LogLevel,
  tag: string,
  message: string,
  data?: unknown,
  requestId?: string,
  traceId?: string,
  perf?: LogEntry["performance"]
): void {
  const entry: LogEntry = {
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

  if (perf) {
    entry.performance = perf;
  }

  const line = JSON.stringify(entry);

  // Invoke hook if registered
  if (logHook) {
    try {
      logHook(entry);
    } catch {
      // Silently ignore hook errors to prevent recursion or infinite loops
    }
  }

  switch (level) {
    case "warn":
      console.warn(line);
      break;
    case "error":
      console.error(line);
      break;
    default:
      console.log(line);
      break;
  }
}

export const logger = {
  info: (tag: string, message: string, data?: unknown) => writeLog("info", tag, message, data),
  warn: (tag: string, message: string, data?: unknown) => writeLog("warn", tag, message, data),
  error: (tag: string, message: string, data?: unknown) => writeLog("error", tag, message, data),

  /**
   * Starts a performance timer for an operation.
   */
  startTimer: (tag: string, operationId: string) => {
    const key = `${tag}:${operationId}`;
    timers.set(key, {
      startTime: performance.now(),
      startMemory: typeof process !== "undefined" ? process.memoryUsage().rss : 0,
    });
    performance.mark(`${key}-start`);
  },

  /**
   * Ends a performance timer and logs the results.
   */
  endTimer: (tag: string, operationId: string, message: string, data?: unknown) => {
    const key = `${tag}:${operationId}`;
    const startData = timers.get(key);
    if (!startData) return;

    performance.mark(`${key}-end`);
    performance.measure(key, `${key}-start`, `${key}-end`);

    const durationMs = performance.now() - startData.startTime;
    const endMemory = typeof process !== "undefined" ? process.memoryUsage().rss : 0;
    const memoryUsageMb = (endMemory - startData.startMemory) / 1024 / 1024;

    writeLog("info", tag, message, data, undefined, undefined, {
      durationMs,
      memoryUsageMb: Math.max(0, memoryUsageMb),
    });

    timers.delete(key);
  },

  /**
   * Registers a global hook that receives every log entry.
   */
  setHook: (hook: LogHook) => {
    logHook = hook;
  },

  /**
   * Returns a request-scoped logger that automatically includes requestId in every entry.
   * Usage: const log = logger.withReqId(req.requestId);
   */
  withReqId: (requestId: string) => ({
    info: (tag: string, message: string, data?: unknown) =>
      writeLog("info", tag, message, data, requestId),
    warn: (tag: string, message: string, data?: unknown) =>
      writeLog("warn", tag, message, data, requestId),
    error: (tag: string, message: string, data?: unknown) =>
      writeLog("error", tag, message, data, requestId),
    /** Attach a traceId to this request-scoped logger for cross-service chain tracing. */
    withTrace: (traceId: string) => ({
      info: (tag: string, message: string, data?: unknown) =>
        writeLog("info", tag, message, data, requestId, traceId),
      warn: (tag: string, message: string, data?: unknown) =>
        writeLog("warn", tag, message, data, requestId, traceId),
      error: (tag: string, message: string, data?: unknown) =>
        writeLog("error", tag, message, data, requestId, traceId),
    }),
  }),

  /**
   * Returns a trace-scoped logger (cross-service chain; no specific HTTP request).
   * Usage: const log = logger.withTrace(traceId);
   */
  withTrace: (traceId: string) => ({
    info: (tag: string, message: string, data?: unknown) =>
      writeLog("info", tag, message, data, undefined, traceId),
    warn: (tag: string, message: string, data?: unknown) =>
      writeLog("warn", tag, message, data, undefined, traceId),
    error: (tag: string, message: string, data?: unknown) =>
      writeLog("error", tag, message, data, undefined, traceId),
  }),
};

/** Convenience type for request-scoped loggers returned by logger.withReqId(). */
export type ScopedLogger = ReturnType<typeof logger.withReqId>;

/** Convenience type for trace-scoped loggers (cross-service propagation). */
export type TraceLogger = ReturnType<typeof logger.withTrace>;
