/* global window, HTMLElement */

import { AuthMode } from "../atoms/types";
import {
  clearStoredToken,
  clearStoredGeminiToken,
  getStoredToken,
  getStoredGeminiToken,
  getAuthProvider,
  getStoredAzureConfig,
  hasStoredAuthState,
  setAuthProvider,
  setStoredAzureConfig,
} from "../atoms/storage-provider";
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

    if (hasStoredAuthState()) {
      const storedGeminiToken = getStoredGeminiToken();
      let provider = getAuthProvider();
      const azure = getStoredAzureConfig();

      if (provider === "gemini_cli" && storedGeminiToken) {
        clearStoredGeminiToken();
      }

      if (provider === "gemini_cli") {
        provider = "gemini_cli";
      } else if (provider === "gemini_api" && !storedGeminiToken) {
        setAuthProvider("preview");
        provider = "preview";
      }

      if (provider === "preview") {
        this.ui.showSuccess("Preview", "Preview mode active.");
      } else if (provider === "copilot_cli") {
        this.ui.showSuccess("CLI", "GitHub CLI session restored.");
      } else if (provider === "gemini_cli") {
        this.ui.showSuccess("Gemini CLI", "Gemini CLI session restored.");
      } else if (provider === "gemini_api") {
        this.ui.showSuccess("Gemini", "Gemini API session restored.");
      } else if (provider === "azure_openai" || provider === "azure_byok") {
        const hasAzureConfig = azure.key || azure.endpoint || azure.deployment;
        this.ui.showSuccess("Azure", hasAzureConfig ? "Azure OpenAI configuration restored." : "Azure OpenAI mode active.");
      } else if (getStoredGeminiToken()) {
        this.ui.showSuccess("Gemini", "Stored Gemini token is active.");
      } else if (getStoredToken()) {
        this.ui.showSuccess("GitHub", "Stored GitHub token is active.");
      } else {
        this.ui.showSuccess("Session", "Stored session restored.");
      }

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
    btns.welcomeConnectBtn?.addEventListener("click", async () => {
      const ok = await this.github.handlePATConnect("pat-input");
      if (ok) this.onAuthStateChanged?.();
    });
    btns.geminiConnectBtn?.addEventListener("click", async () => {
      const ok = await this.gemini.handleConnect("gemini-input");
      if (ok) this.onAuthStateChanged?.();
    });
    btns.geminiCliConnectBtn?.addEventListener("click", async () => {
      const ok = await this.gemini.handleCliConnect();
      if (ok) this.onAuthStateChanged?.();
    });
    btns.geminiApiBtn?.addEventListener("click", async () => {
      const ok = await this.gemini.handleConnect("gemini-input");
      if (ok) this.onAuthStateChanged?.();
    });
    btns.azureConnectBtn?.addEventListener("click", async () => {
      const key = (document.getElementById("azure-key-input") as HTMLInputElement | null)?.value.trim();
      const endpoint = (document.getElementById("azure-endpoint-input") as HTMLInputElement | null)?.value.trim();
      const deployment = (document.getElementById("azure-deployment-input") as HTMLInputElement | null)?.value.trim();

      if (!key || !endpoint || !deployment) {
        this.ui.setStatus("Please enter all Azure OpenAI credentials.");
        return;
      }

      this.ui.setStatus("Validating Azure configuration via ACP...");
      try {
        const { validateACPToken } = await import("../organisms/api-orchestrator");
        const val = await validateACPToken("azure", key, endpoint, deployment);
        
        if (val.ok) {
          setStoredAzureConfig(key, endpoint, deployment);
          this.ui.showSuccess("Azure", "Azure OpenAI validated and saved successfully.");
          this.onAuthStateChanged?.();
        } else {
          this.ui.setStatus(`Azure Error: ${val.message}`);
        }
      } catch {
        this.ui.setStatus("Failed to validate Azure credentials.");
      }
    });
    btns.cliConnectBtn?.addEventListener("click", async () => {
      this.ui.setStatus("Detecting GitHub CLI session via ACP...");
      try {
        const { validateACPToken } = await import("../organisms/api-orchestrator");
        const val = await validateACPToken("copilot", ""); // Send empty token to test local credentials
        if (val.ok) {
          const s = await import("../atoms/storage-provider");
          s.setAuthProvider("copilot_cli");
          this.ui.showSuccess("CLI", "GitHub CLI session perfectly detected!");
          this.onAuthStateChanged?.();
        } else {
          this.ui.setStatus(`Error: Local CLI session is dead or missing. (${val.message})`);
        }
      } catch {
        this.ui.setStatus("Failed to validate CLI session.");
      }
    });
    btns.oauthConnectBtn?.addEventListener("click", () => {
      this.github.handleOAuthConnect();
    });
    btns.skipBtn?.addEventListener("click", async (e) => {
      e.preventDefault();
      const s = await import("../atoms/storage-provider");
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
    getAuthProvider: () => (getAuthProvider() || "none"),
    bindButtons: (btns: Record<string, HTMLElement | null>) => orch.bindButtons(btns),
    handleUnauthorized: () => orch.handleLogout(),
  };
}
