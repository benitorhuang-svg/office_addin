/**
 * Molecule: Temp Session Store
 * Manages short-lived OAuth session-to-token mappings.
 */
class SessionStore {
  private store = new Map<string, string>();

  public set(id: string, token: string, expiryMs: number = 60000) {
    this.store.set(id, token);
    setTimeout(() => this.delete(id), expiryMs);
  }

  public get(id: string): string | undefined {
    return this.store.get(id);
  }

  public delete(id: string) {
    this.store.delete(id);
  }
}

export const SESSION_STORE = new SessionStore();
