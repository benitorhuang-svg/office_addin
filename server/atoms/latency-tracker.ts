/**
 * Atom: Latency Tracker
 * Lightweight performance markers for startup and request-level timing.
 */

const marks = new Map<string, number>();

export function markStart(label: string): void {
  marks.set(label, performance.now());
}

export function markEnd(label: string): number {
  const start = marks.get(label);
  if (start === undefined) return -1;
  const elapsed = Math.round(performance.now() - start);
  marks.delete(label);
  console.log(`[Perf] ${label}: ${elapsed}ms`);
  return elapsed;
}

export function markElapsed(label: string): number {
  const start = marks.get(label);
  if (start === undefined) return -1;
  return Math.round(performance.now() - start);
}
