/**
 * Molecule: Temp Session Store
 * Manages short-lived OAuth session-to-token mappings.
 */
class SessionStore {
  private store = new Map<string, string>();
  private timers = new Map<string, ReturnType<typeof setTimeout>>();

  public set(id: string, token: string, expiryMs: number = 60000) {
    // Clear existing timer if any
    const existing = this.timers.get(id);
    if (existing) clearTimeout(existing);

    this.store.set(id, token);
    const timer = setTimeout(() => this.delete(id), expiryMs);
    this.timers.set(id, timer);
  }

  public get(id: string): string | undefined {
    return this.store.get(id);
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

