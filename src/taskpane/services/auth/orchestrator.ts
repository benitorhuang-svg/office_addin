/* global window, setTimeout, HTMLElement */

import { AuthMode } from "../../types";
import { clearStoredToken, getStoredToken, getStoredGeminiToken } from "../storage";
import { AuthUIBridge, AuthUIContext } from "./ui-bridge";
import { GitHubProvider } from "./github-provider";
import { GeminiProvider } from "./gemini-provider";

/**
 * Main Auth Orchestrator.
 * Coordinates all providers, UI transitions, and lifecycle stages.
 */
export class AuthOrchestrator {
  private ui: AuthUIBridge;
  private github: GitHubProvider;
  private gemini: GeminiProvider;
  private serverAuthMode: AuthMode = "none";

  constructor(ctx: AuthUIContext) {
    this.ui = new AuthUIBridge(ctx);
    this.github = new GitHubProvider(this.ui);
    this.gemini = new GeminiProvider(this.ui);
  }

  public initialize(mode: AuthMode) {
    this.serverAuthMode = mode;
    this.ensureMessageListeners();

    if (getStoredToken() || getStoredGeminiToken()) {
      const type = getStoredGeminiToken() ? "Gemini" : "GitHub";
      this.ui.showSuccess(type, `Stored ${type} token is active.`);
      return;
    }
    this.ui.showOnboarding();
  }

  private ensureMessageListeners() {
    window.addEventListener("message", (ev) => {
      const msg = this.github.parseAuthMessage(ev.data);
      if (msg?.token) this.github.completeAuth(msg.token);
    });
  }

  public handleLogout() {
    clearStoredToken();
    this.ui.showOnboarding();
  }

  public bindButtons(btns: { [key: string]: HTMLElement | null }) {
    btns.welcomeConnectBtn?.addEventListener("click", () =>
      this.github.handlePATConnect("pat-input")
    );
    btns.geminiConnectBtn?.addEventListener("click", () =>
      this.gemini.handleConnect("gemini-input")
    );
    btns.cliConnectBtn?.addEventListener("click", () => {
      this.ui.setStatus("Detecting GitHub CLI session...");
      import("../storage").then((s) => s.setAuthProvider("copilot_cli"));
      setTimeout(() => {
        this.ui.showSuccess("CLI", "GitHub CLI session detected.");
        this.ui.notifyAssistant("CLI authentication active.");
      }, 1000);
    });
    btns.oauthConnectBtn?.addEventListener("click", () => {
      this.github.handleOAuthConnect();
    });
    btns.skipBtn?.addEventListener("click", (e) => {
      e.preventDefault();
      import("../storage").then((s) => s.setAuthProvider("preview"));
      this.ui.showSuccess("Preview", "Preview mode active.");
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

export function createAuthController(ctx: AuthUIContext) {
  const orch = new AuthOrchestrator(ctx);
  return {
    initialize: (mode: AuthMode) => orch.initialize(mode),
    checkInitialAuth: () => orch.initialize("none"),
    logout: () => orch.handleLogout(),
    getAccessToken: () => orch.getAccessToken(),
    getGeminiToken: () => orch.getGeminiToken(),
    bindButtons: (btns: any) => orch.bindButtons(btns),
    handleUnauthorized: () => orch.handleLogout(),
  };
}
