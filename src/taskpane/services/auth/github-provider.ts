/* global Office */
import { setStoredToken, getStoredToken } from "../storage";
import { AuthUIBridge } from "./ui-bridge";

/**
 * Atomic Github Auth Provider.
 * Handles OAuth parsing, local PAT extraction, and dialog lifecycle.
 */
export class GitHubProvider {
  constructor(private ui: AuthUIBridge) {}

  public parseAuthMessage(rawMessage: any) {
    try {
      const parsed = typeof rawMessage === "string" ? JSON.parse(rawMessage) : rawMessage;
      if (parsed?.type === "github-auth") {
        return parsed as { type: "github-auth"; token?: string };
      }
    } catch {}
    return null;
  }

  public completeAuth(token: string) {
    setStoredToken(token || "");
    this.ui.showSuccess("GitHub", "GitHub sign-in completed.");
    this.ui.notifyAssistant("Welcome! GitHub authentication complete.");
  }

  public handlePATConnect(inputElId: string) {
    const el = document.getElementById(inputElId) as HTMLInputElement;
    const token = el?.value?.trim();
    if (token) {
      this.completeAuth(token);
      return true;
    }
    return false;
  }
}
