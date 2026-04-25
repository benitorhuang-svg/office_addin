import crypto from "crypto";

interface SessionData {
  token: string;
  accessCount: number;
  createdAt: number;
}

/**
 * Molecule: Temp Session Store
 * Manages short-lived OAuth session-to-token mappings with defensive limits.
 * Wave 1: Defensive Foundation - Entropy & Memory Limits
 */
class SessionStore {
  private store = new Map<string, SessionData>();
  private timers = new Map<string, ReturnType<typeof setTimeout>>();
  private readonly MAX_SESSIONS = 1000;
  private readonly DEFAULT_EXPIRY = 60000; // 1 minute

  /**
   * Generates a high-entropy session ID.
   */
  public generateId(): string {
    return crypto.randomUUID();
  }

  public set(id: string, token: string, expiryMs: number = this.DEFAULT_EXPIRY) {
    // Basic format validation: must be a UUID or a prefixed internal key
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    const isPrefixed = id.startsWith("state:") || id.startsWith("verifier:");

    if (!id || typeof id !== "string" || (!isUuid && !isPrefixed)) {
      throw new Error("Invalid session ID format: Entropy requirement not met");
    }

    // Memory Limit: Prevent OOM by capping total active sessions
    if (this.store.size >= this.MAX_SESSIONS && !this.store.has(id)) {
      // Evict oldest if we reach limit (simple strategy)
      const oldestKey = this.store.keys().next().value;
      if (oldestKey) this.delete(oldestKey);
    }

    // Clear existing timer if any
    const existing = this.timers.get(id);
    if (existing) clearTimeout(existing);

    this.store.set(id, {
      token,
      accessCount: 0,
      createdAt: Date.now(),
    });

    const timer = setTimeout(() => this.delete(id), expiryMs);
    timer.unref(); // Prevent timer from keeping the process alive
    this.timers.set(id, timer);
  }

  public get(id: string): string | undefined {
    const session = this.store.get(id);
    if (!session) return undefined;

    session.accessCount += 1;
    // Anomaly detection: single session shouldn't be accessed too many times
    if (session.accessCount > 100) {
      this.delete(id);
      return undefined;
    }

    return session.token;
  }

  public delete(id: string) {
    this.store.delete(id);
    const timer = this.timers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(id);
    }
  }

  public clear() {
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    this.store.clear();
    this.timers.clear();
  }
}

export const SESSION_STORE: SessionStore = new SessionStore();
