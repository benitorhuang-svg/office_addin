/**
 * Organism Service: Auth Orchestrator
 * Coordinates all providers, lifecycle stages, and global state sync.
 */
import { AuthMode, AuthUIContext, AuthStatusProxy, NexusProvider, NexusPowerState } from "@shared/types";
import {
  clearStoredToken,
  clearStoredGeminiToken,
  getStoredToken,
  getStoredGeminiToken,
  getAuthProvider,
  hasStoredAuthState,
  setAuthProvider,
  setStoredAzureConfig,
} from "../../atoms/storage-provider";
import { GitHubProvider } from "./github-provider";
import { GeminiProvider } from "./gemini-provider";
import { NexusStateStore } from "../../molecules/global-state";
import { Toast } from "../../../components/molecules/Toast";
import { HistoryManager } from "../../molecules/HistoryManager";
import { AppOrchestrator } from "../../organisms/AppOrchestrator";

export interface AuthControllerCallbacks {
  onAuthStateChanged?: () => void;
}

export class AuthOrchestrator {
  private github: GitHubProvider;
  private gemini: GeminiProvider;
  private onAuthStateChanged?: () => void;
  private ctx: AuthUIContext;

  constructor(ctx: AuthUIContext, callbacks?: AuthControllerCallbacks) {
    this.ctx = ctx;
    this.onAuthStateChanged = callbacks?.onAuthStateChanged;
    
    // UI Proxies bridge Providers to modern Atomic Components
    const uiProxy = this.createUiProxy();
    this.github = new GitHubProvider(uiProxy); 
    this.gemini = new GeminiProvider(uiProxy);
  }

  /**
   * Atomic UI Proxy for legacy Providers.
   * Redirects feedback loops to modern molecules.
   */
  private createUiProxy(): AuthStatusProxy {
      return {
          setStatus: (msg: string) => { 
              if (msg) Toast.show(msg, msg.toLowerCase().includes("error") || msg.toLowerCase().includes("failed") ? "error" : "info");
          },
          showSuccess: (type: string, _msg: string) => {
              Toast.show(`AUTH_SYNC: [${type.toUpperCase()}]`, "success");
              AppOrchestrator.clearHomeResetLock();
              NexusStateStore.update({ power: NexusPowerState.ON });
              this.onAuthStateChanged?.();
          },
          showOnboarding: (msg?: string) => {
              if (msg) Toast.show(msg, "info");
          },
          notifyAssistant: (msg: string, isStory: boolean = true, animate: boolean = false) => {
              HistoryManager.appendMessage({ historyEl: this.ctx.historyEl, role: "assistant", text: msg, isStory, animate });
          },
      };
  }

  public async initialize(mode: AuthMode): Promise<void> {
    this.ensureMessageListeners();
    console.log(`%c[AUTH_ORCHESTRATOR] Matrix_Boot: ${mode}`, "color: #fb923c; font-weight: bold;");
    return this.checkStoredAuth();
  }

  private async checkStoredAuth(): Promise<void> {
    if (await hasStoredAuthState()) {
      const storedGeminiToken = await getStoredGeminiToken();
      const provider = getAuthProvider();

      if (provider === "gemini_cli" && storedGeminiToken) {
        clearStoredGeminiToken();
      }

      NexusStateStore.update({ power: NexusPowerState.ON });
      this.onAuthStateChanged?.();
      return;
    }
    this.createUiProxy().showOnboarding();
  }

  private ensureMessageListeners() {
    window.addEventListener("message", (ev) => {
      const msg = this.github.parseAuthMessage(ev.data);
      if (msg?.token) {
        this.github.completeAuth(msg.token);
        this.onAuthStateChanged?.();
      }
    });

    window.addEventListener("storage", () => {
      this.onAuthStateChanged?.();
    });

    window.addEventListener("NEXUS_RELOGIN_TRIGGER", () => {
        console.log("[AUTH] Relogin trigger received from UI Card");
        this.handleLogout();
    });
  }

  public async handleLogout(): Promise<void> {
    clearStoredToken();
    clearStoredGeminiToken();
    NexusStateStore.setProvider(NexusProvider.NONE);
    NexusStateStore.update({ power: NexusPowerState.STANDBY });
    this.createUiProxy().showOnboarding("UPLINK_TERMINATED");
    this.onAuthStateChanged?.();
  }

  public bindButtons(btns: { [key: string]: HTMLElement | null }) {
    btns.welcomeConnectBtn?.addEventListener("click", () => {
        AppOrchestrator.clearHomeResetLock();
        return this.github.handlePATConnect("pat-input").then(ok => ok && this.onAuthStateChanged?.());
    });
    btns.geminiConnectBtn?.addEventListener("click", () => {
        AppOrchestrator.clearHomeResetLock();
        return this.gemini.handleConnect("gemini-input").then(ok => ok && this.onAuthStateChanged?.());
    });
    btns.geminiCliConnectBtn?.addEventListener("click", () => {
        AppOrchestrator.clearHomeResetLock();
        return this.gemini.handleCliConnect().then(ok => ok && this.onAuthStateChanged?.());
    });
    
    btns.azureConnectBtn?.addEventListener("click", async () => {
      const key = (document.getElementById("azure-key-input") as HTMLInputElement | null)?.value.trim();
      const endpoint = (document.getElementById("azure-endpoint-input") as HTMLInputElement | null)?.value.trim();
      const deployment = (document.getElementById("azure-deployment-input") as HTMLInputElement | null)?.value.trim();

      if (!key || !endpoint || !deployment) {
        Toast.show("VALIDATION_ERROR: NULL_CREDENTIALS", "error");
        return;
      }

      try {
        const { validateACPToken } = await import("../../organisms/api-orchestrator");
        const val = await validateACPToken("azure", key, endpoint, deployment);
        if (val.ok) {
          setStoredAzureConfig(key, endpoint, deployment);
          Toast.show("AZURE_SYNAPSE_CONNECTED", "success");
          this.onAuthStateChanged?.();
        } else {
          Toast.show(`AZURE_REFUSED: ${val.message}`, "error");
        }
      } catch {
        Toast.show("UPLINK_FAILURE", "error");
      }
    });

    btns.cliConnectBtn?.addEventListener("click", async () => {
      try {
        const { validateACPToken } = await import("../../organisms/api-orchestrator");
        const val = await validateACPToken("copilot", ""); 
        if (val.ok) {
          setAuthProvider("copilot_cli");
          Toast.show("CLI_DETECTED: SUCCESS", "success");
          this.onAuthStateChanged?.();
        } else {
          Toast.show("CLI_UPLINK_NOT_FOUND", "error");
        }
      } catch {
        Toast.show("CLI_PROBE_FAILED", "error");
      }
    });

    btns.oauthConnectBtn?.addEventListener("click", () => {
        Toast.show("OAUTH_HANDSHAKE_START", "info");
        this.github.handleOAuthConnect();
    });

    btns.welcomeSkipBtn?.addEventListener("click", () => {
        console.log("[AUTH] Bypassing via Preview_Mode");
        NexusStateStore.setProvider(NexusProvider.PREVIEW);
        NexusStateStore.update({ power: NexusPowerState.ON });
        setAuthProvider("preview");
        if (this.onAuthStateChanged) this.onAuthStateChanged();
        this.createUiProxy().notifyAssistant("您好！我是您的智慧編輯夥伴。目前正處於「預覽模式」，您可以直接描述您想要完成的檔案編輯任務。", true, true); 
    });

    btns.reloginBtn?.addEventListener("click", () => this.handleLogout());
  }

  public async getAccessToken() { return await getStoredToken(); }
  public async getGeminiToken() { return await getStoredGeminiToken(); }
  public async login() { 
      this.github.handleOAuthConnect();
  }
}

export function createAuthController(ctx: AuthUIContext, callbacks?: AuthControllerCallbacks) {
  const orch = new AuthOrchestrator(ctx, callbacks);
  return {
    initialize: (mode: AuthMode) => orch.initialize(mode),
    checkInitialAuth: () => orch.initialize("none"),
    logout: () => orch.handleLogout(),
    login: () => orch.login(),
    getAccessToken: () => orch.getAccessToken(),
    getGeminiToken: () => orch.getGeminiToken(),
    getAuthProvider: () => (getAuthProvider() || "none"),
    bindButtons: (btns: Record<string, HTMLElement | null>) => orch.bindButtons(btns),
    handleUnauthorized: () => orch.handleLogout(),
  };
}
