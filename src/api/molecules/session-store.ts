// @ts-expect-error - uuid types might be missing in some environments
import { validate as validateUuid } from 'uuid';

interface SessionData {
  token: string;
  accessCount: number;
}

/**
 * Molecule: Temp Session Store
 * Manages short-lived OAuth session-to-token mappings.
 */
class SessionStore {
  private store = new Map<string, SessionData>();
  private timers = new Map<string, ReturnType<typeof setTimeout>>();

  public set(id: string, token: string, expiryMs: number = 60000) {
    if (!id || typeof id !== 'string' || (!validateUuid(id) && !id.startsWith('state:') && !id.startsWith('verifier:'))) {
      throw new Error('Invalid session ID format');
    }
    
    // Clear existing timer if any
    const existing = this.timers.get(id);
    if (existing) clearTimeout(existing);

    this.store.set(id, { token, accessCount: 0 });
    const timer = setTimeout(() => this.delete(id), expiryMs);
    timer.unref(); // Prevent timer from keeping the process alive
    this.timers.set(id, timer);
  }

  public get(id: string): string | undefined {
    const session = this.store.get(id);
    if (!session) return undefined;

    session.accessCount += 1;
    if (session.accessCount > 50) {
      this.delete(id);
      throw new Error('Session access anomaly detected: too many requests');
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
}

export const SESSION_STORE: SessionStore = new SessionStore();

