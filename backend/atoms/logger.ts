/**
 * Atom: Structured Logger
 * Provides consistent logging format across the server.
 */
export const logger = {
  info: (tag: string, msg: string, data?: object) =>
    console.log(`[${new Date().toISOString()}] [INFO] [${tag}] ${msg}`, data ? JSON.stringify(data) : ''),
  warn: (tag: string, msg: string, data?: object) =>
    console.warn(`[${new Date().toISOString()}] [WARN] [${tag}] ${msg}`, data ? JSON.stringify(data) : ''),
  error: (tag: string, msg: string, data?: object) =>
    console.error(`[${new Date().toISOString()}] [ERROR] [${tag}] ${msg}`, data ? JSON.stringify(data) : ''),
};
