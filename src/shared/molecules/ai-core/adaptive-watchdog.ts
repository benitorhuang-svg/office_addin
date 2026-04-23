/**
 * Molecule: Adaptive Watchdog
 * Maintains per-model latency statistics and dynamically computes timeout values.
 */

interface LatencyStats {
  count: number;
  p50: number;
  p95: number;
  p99: number;
  lastUpdated: number;
}

const MIN_TIMEOUT_MS = 30_000;   // 30s floor
const MAX_TIMEOUT_MS = 600_000;  // 10min ceiling
const DEFAULT_TIMEOUT_MS = 300_000; // 5min default for unknown models
const MAX_SAMPLES = 100;          // Rolling window size

const samples = new Map<string, number[]>();

export const AdaptiveWatchdog = {
  recordLatency(model: string, latencyMs: number): void {
    let modelSamples = samples.get(model);
    if (!modelSamples) {
      modelSamples = [];
      samples.set(model, modelSamples);
    }
    modelSamples.push(latencyMs);
    if (modelSamples.length > MAX_SAMPLES) {
      modelSamples.shift();
    }
  },

  getTimeout(model: string): number {
    const stats = this.getStats(model);
    if (stats.count < 3) return DEFAULT_TIMEOUT_MS;

    const computed = Math.round(stats.p95 * 2);
    return Math.min(Math.max(computed, MIN_TIMEOUT_MS), MAX_TIMEOUT_MS);
  },

  getStats(model: string): LatencyStats {
    const modelSamples = samples.get(model);
    if (!modelSamples || modelSamples.length === 0) {
      return { count: 0, p50: 0, p95: 0, p99: 0, lastUpdated: 0 };
    }

    const sorted = [...modelSamples].sort((a, b) => a - b);
    const len = sorted.length;
    // Use Math.min to guard against floating-point rounding producing an out-of-bounds index.
    const idx = (pct: number) => Math.min(Math.floor(len * pct), len - 1);

    return {
      count: len,
      p50: sorted[idx(0.5)],
      p95: sorted[idx(0.95)],
      p99: sorted[idx(0.99)],
      lastUpdated: Date.now(),
    };
  },

  reset(): void {
    samples.clear();
  },
};
