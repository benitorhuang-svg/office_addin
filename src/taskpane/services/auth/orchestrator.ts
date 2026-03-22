/* global window, HTMLElement */

import { AuthMode } from "../../types";
import { clearStoredToken, getStoredToken, getStoredGeminiToken } from "../storage";
import { AuthUIBridge, AuthUIContext } from "./ui-bridge";
import { GitHubProvider } from "./github-provider";
import { GeminiProvider } from "./gemini-provider";

export interface AuthControllerCallbacks {
  onAuthStateChanged?: () => void;
}

/**
 * Main Auth Orchestrator.
 * Coordinates all providers, UI transitions, and lifecycle stages.
 */
export class AuthOrchestrator {
  private ui: AuthUIBridge;
  private github: GitHubProvider;
  private gemini: GeminiProvider;
  private onAuthStateChanged?: () => void;

  constructor(ctx: AuthUIContext, callbacks?: AuthControllerCallbacks) {
    this.ui = new AuthUIBridge(ctx);
    this.github = new GitHubProvider(this.ui);
    this.gemini = new GeminiProvider(this.ui);
    this.onAuthStateChanged = callbacks?.onAuthStateChanged;
  }

  public initialize(mode: AuthMode) {
    this.ensureMessageListeners();

    console.log(`[Auth] Initializing in mode: ${mode}`);

    if (getStoredToken() || getStoredGeminiToken()) {
      const type = getStoredGeminiToken() ? "Gemini" : "GitHub";
      this.ui.showSuccess(type, `Stored ${type} token is active.`);
      this.onAuthStateChanged?.();
      return;
    }
    this.ui.showOnboarding();
  }

  private ensureMessageListeners() {
    window.addEventListener("message", (ev) => {
      const msg = this.github.parseAuthMessage(ev.data);
      if (msg?.token) {
        this.github.completeAuth(msg.token);
        this.onAuthStateChanged?.();
      }
    });

    // We can also poll or listen for localStorage changes for simpler state sync
    window.addEventListener("storage", () => {
      this.onAuthStateChanged?.();
    });
  }

  public handleLogout() {
    clearStoredToken();
    this.ui.showOnboarding();
    this.onAuthStateChanged?.();
  }

  public bindButtons(btns: { [key: string]: HTMLElement | null }) {
    btns.welcomeConnectBtn?.addEventListener("click", () =>
      this.github.handlePATConnect("pat-input")
    );
    btns.geminiConnectBtn?.addEventListener("click", async () => {
      await this.gemini.handleConnect("gemini-input");
      this.onAuthStateChanged?.();
    });
    btns.geminiCliConnectBtn?.addEventListener("click", async () => {
      await this.gemini.handleCliConnect();
      this.onAuthStateChanged?.();
    });
    btns.geminiApiBtn?.addEventListener("click", async () => {
      await this.gemini.handleConnect("gemini-input");
      this.onAuthStateChanged?.();
    });
    btns.cliConnectBtn?.addEventListener("click", async () => {
      this.ui.setStatus("Detecting GitHub CLI session...");
      const s = await import("../storage");
      s.setAuthProvider("copilot_cli");
      this.ui.showSuccess("CLI", "GitHub CLI session detected.");
      this.onAuthStateChanged?.();
    });
    btns.oauthConnectBtn?.addEventListener("click", () => {
      this.github.handleOAuthConnect();
    });
    btns.skipBtn?.addEventListener("click", async (e) => {
      e.preventDefault();
      const s = await import("../storage");
      s.setAuthProvider("preview");
      this.ui.showSuccess("Preview", "Preview mode active.");
      this.onAuthStateChanged?.();
    });
    btns.reloginBtn?.addEventListener("click", () => this.handleLogout());
  }

  public getAccessToken() {
    return getStoredToken();
  }
  public getGeminiToken() {
    return getStoredGeminiToken();
  }
}

export function createAuthController(ctx: AuthUIContext, callbacks?: AuthControllerCallbacks) {
  const orch = new AuthOrchestrator(ctx, callbacks);
  return {
    initialize: (mode: AuthMode) => orch.initialize(mode),
    checkInitialAuth: () => orch.initialize("none"),
    logout: () => orch.handleLogout(),
    getAccessToken: () => orch.getAccessToken(),
    getGeminiToken: () => orch.getGeminiToken(),
    bindButtons: (btns: Record<string, HTMLElement | null>) => orch.bindButtons(btns),
    handleUnauthorized: () => orch.handleLogout(),
  };
}
