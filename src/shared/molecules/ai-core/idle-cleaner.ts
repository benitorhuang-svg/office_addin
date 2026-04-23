/**
 * Molecule: Idle Cleaner
 * Periodically scans for idle CopilotClient instances and cleans them up.
 */

import { logger } from '@shared/logger/index.js';

const DEFAULT_IDLE_MINUTES = 30;
const SCAN_INTERVAL_MS = 5 * 60_000; // 5 minutes

interface IdleEntry {
  lastActivity: number;
  key: string;
}

const activityLog = new Map<string, number>();
let scanTimer: ReturnType<typeof setInterval> | null = null;

export const IdleCleaner = {
  /** Record activity for a client key */
  touch(key: string): void {
    activityLog.set(key, Date.now());
  },

  /** Check if a client key is idle beyond the threshold */
  isIdle(key: string): boolean {
    const last = activityLog.get(key);
    if (!last) return true;
    const idleMs = this.getIdleThresholdMs();
    return Date.now() - last > idleMs;
  },

  /** Get all idle entries */
  getIdleEntries(): IdleEntry[] {
    const threshold = this.getIdleThresholdMs();
    const now = Date.now();
    const idle: IdleEntry[] = [];
    for (const [key, lastActivity] of activityLog) {
      if (now - lastActivity > threshold) {
        idle.push({ key, lastActivity });
      }
    }
    return idle;
  },

  /** Remove tracking for a client key */
  remove(key: string): void {
    activityLog.delete(key);
  },

  /** Start periodic idle scanning */
  startScanning(cleanupFn: (key: string) => Promise<void>): void {
    if (scanTimer) return;

    scanTimer = setInterval(async () => {
      const idleEntries = this.getIdleEntries();
      for (const entry of idleEntries) {
        const idleMins = Math.round((Date.now() - entry.lastActivity) / 60_000);
        logger.info('IdleCleaner', 'Cleaning idle client', { key: entry.key, idleMinutes: idleMins });
        try {
          await cleanupFn(entry.key);
          this.remove(entry.key);
        } catch (err) {
          logger.error('IdleCleaner', 'Failed to cleanup idle client', { key: entry.key, error: err });
        }
      }
    }, SCAN_INTERVAL_MS);
    scanTimer.unref();
  },

  /** Stop periodic scanning */
  stopScanning(): void {
    if (scanTimer) {
      clearInterval(scanTimer);
      scanTimer = null;
    }
  },

  getIdleThresholdMs(): number {
    const minutes = Number(process.env.IDLE_CLEANUP_MINUTES) || DEFAULT_IDLE_MINUTES;
    return minutes * 60_000;
  },

  /** Reset all tracking (for tests) */
  reset(): void {
    activityLog.clear();
    this.stopScanning();
  },
};
