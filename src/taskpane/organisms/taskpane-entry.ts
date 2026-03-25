import "../styles/tailwind.css";
import { createAuthController } from "../services/molecules/auth-aggregator";
import {
  setApplyStatus,
  clearChatHistory,
  setPresetDescription,
  hideLoadingScreen,
  startHealthCheck,
  showToast,
} from "../services/molecules/ui-renderer";
import {
  getStoredModel,
  setStoredModel,
  getStoredModelMode,
  setStoredModelMode,
  getStoredPreset,
  setStoredPreset,
  getAuthProvider,
  hasStoredAuthState,
} from "../services/atoms/storage-provider";
import { FALLBACK_PRESETS, getSelectedPreset } from "../services/atoms/preset-manager";
import { ChatOrchestrator } from "../services/organisms/chat-orchestrator";
import { WritingPreset, ChatContext, AuthController } from "../services/atoms/types";
import { ModelManager } from "../services/molecules/model-manager";

import { createHeader } from "../components/organisms/Header";
import { createHistoryContainer } from "../components/organisms/HistoryContainer";
import { createOnboardingOrganism } from "../components/organisms/Onboarding";
import { createPromptGroup } from "../components/molecules/PromptGroup";

/**
 * Organism: Taskpane Controller
 * Central orchestrator for the office_Agent taskpane.
 * Follows Atomic Design for components and delegates logic to specialized services.
 */
class TaskpaneController {
  private els!: Record<string, HTMLElement | null>;
  private authController!: AuthController | null;
  private chatOrchestrator: ChatOrchestrator;
  private writingPresets: WritingPreset[] = [...FALLBACK_PRESETS];
  private availableModels: string[] = [];

  constructor() {
    this.chatOrchestrator = new ChatOrchestrator();
    this.initElements();
  }

  /**
   * Main Render Loop (Reactive update equivalent)
   */
  private renderAtomicDesign(title: string = "office_Agent") {
    const provider = getAuthProvider();
    this.availableModels = ModelManager.getAvailableModels(provider);

    // 1. Render Onboarding (Only if needed)
    const onboardingRoot = document.getElementById("onboarding-root");
    if (onboardingRoot && onboardingRoot.innerHTML === "") {
      onboardingRoot.appendChild(createOnboardingOrganism());
    }

    // 2. Render Header (Only if provider changed or title mismatch)
    const headerRoot = document.getElementById("header-root");
    if (headerRoot) {
      if (headerRoot.innerHTML === "" || headerRoot.dataset.provider !== provider) {
        headerRoot.innerHTML = "";
        headerRoot.dataset.provider = provider || "";
        headerRoot.appendChild(
          createHeader({
            title: title,
            authProvider: provider,
            onClearChat: () => this.handleClearChat(),
          })
        );
      }
    }

    // 3. Render History (Only if empty)
    const historyRoot = document.getElementById("history-root");
    if (historyRoot && historyRoot.innerHTML === "") {
      historyRoot.appendChild(createHistoryContainer({ authProvider: provider }));
    }

    // 4. Render/Update Prompt Controls
    const promptRoot = document.getElementById("prompt-root");
    if (promptRoot) {
      if (promptRoot.innerHTML === "" || promptRoot.dataset.provider !== provider) {
         promptRoot.innerHTML = "";
         promptRoot.dataset.provider = provider || "";
         promptRoot.appendChild(
           createPromptGroup({
             onSend: () => this.handleSendMessage(),
             availableModels: this.availableModels,
             selectedModel: getStoredModel() || ModelManager.getDefaultModel(this.availableModels),
             modelMode: getStoredModelMode(),
             onModelChange: (m) => this.handleModelChange(m),
             onModeChange: (mode) => this.handleModeChange(mode),
             onLogout: () => this.authController?.logout(),
           })
         );
      } else {
        // Targeted update of simple values
        const modelSelect = document.getElementById("model-select") as HTMLSelectElement;
        if (modelSelect) modelSelect.value = getStoredModel() || "";
      }
    }
  }

  private handleModeChange(mode: "auto" | "manual") {
    setStoredModelMode(mode);
    this.renderAndRebind();
    showToast(`Model mode changed to ${mode}`, "info");
  }

  private handleModelChange(m: string) {
    setStoredModel(m);
    showToast(`Model set to ${m}`, "info");
  }

  private initElements() {
    this.els = {
      historyEl: document.getElementById("chat-history"),
      promptEl: document.getElementById("chat-input"),
      sendBtn: document.getElementById("send-btn"),
      applyStatus: document.getElementById("apply-status"),
      presetSelect: document.getElementById("preset-select"),
      modelSelect: document.getElementById("model-select"),
      presetDescription: document.getElementById("preset-description"),
      runtimeModel: document.getElementById("runtime-model"),
    };
  }

  public async init() {
    // If opened as an OAuth dialog (preview), render a minimal dialog showing current auth method
    try {
      const dialogUrl = new URL(window.location.href);
      const oauthMode = dialogUrl.searchParams.get("oauth");
      if (oauthMode) {
        const authProvider = getAuthProvider() || "none";
        document.body.innerHTML = "";
        const wrap = document.createElement("div");
        wrap.className = "p-6 text-center";
        wrap.innerHTML = `
          <h2 class="text-xl font-semibold mb-4">OAuth Preview</h2>
          <p class="text-sm text-slate-600 mb-3">Mode: <strong>${oauthMode}</strong></p>
          <p class="text-sm text-slate-700 mb-6">Current login method detected: <strong>${authProvider}</strong></p>
          <p class="text-xs text-slate-500">This dialog is a preview used by the Office popup during development.</p>
        `;
        document.body.appendChild(wrap);
        return; // do not initialize the full taskpane when acting as dialog
      }
    } catch (_e) {
      // ignore and continue normal init
    }
    // Initial fetch of config to remove hardcoding
    let title = "office_Agent";
    try {
      const { getConfig } = await import("../services/organisms/api-orchestrator");
      const config = await getConfig();
      if (config.APP_TITLE) title = config.APP_TITLE;
      if (config.FALLBACK_PRESETS) this.writingPresets = config.FALLBACK_PRESETS;
      ChatOrchestrator.config = config;
    } catch { /* fallback to default */ }

    this.renderAtomicDesign(title);
    this.initElements();

    this.authController = createAuthController(
      {
        authStatusEl: document.getElementById("auth-status"),
        applyStatusEl: this.els.applyStatus,
        historyEl: this.els.historyEl,
      },
      {
        onAuthStateChanged: () => {
          this.renderAndRebind();
        },
      }
    );

    this.bindAuthButtons();
    await this.authController.checkInitialAuth();

    // Re-render and re-bind to sync UI with state
    this.renderAndRebind();

    // Auto-connect CLI for development if enabled and not already authenticated
    if (ChatOrchestrator.config?.AUTO_CONNECT_CLI && !hasStoredAuthState()) {
      console.log("[Dev] Auto-connect CLI flag is ON. Preparing connection...");
      setTimeout(() => {
        const copilotCliBtn = document.getElementById("cli-connect-btn");
        const targetBtn = copilotCliBtn;
        
        if (targetBtn) {
          console.log(`[Dev] Auto-triggering connection via ${targetBtn.id}...`);
          
          // Expand the relevant accordion to show progress
          const accordionItem = targetBtn.closest(".accordion-item");
          const header = accordionItem?.querySelector(".accordion-header") as HTMLElement;
          if (header && !accordionItem?.classList.contains("is-open")) {
            header.click();
          }
          
          // Allow time for accordion animation then trigger connection
          setTimeout(() => targetBtn.click(), 400);
        } else {
          console.warn("[Dev] CLI connect buttons not found in current view.");
        }
      }, 500); 
    }

    // Initial Static UI settings
    const currentPreset = getStoredPreset() || "general";
    setPresetDescription(this.els.presetDescription, currentPreset, this.writingPresets);

    // Initial Flow: focus and cleanup loading
    this.els.promptEl?.focus();
    window.scrollTo(0, 0);
    this.initResizer();
    hideLoadingScreen();
    startHealthCheck();
  }

  private initResizer() {
    const resizer = document.createElement("div");
    resizer.className = "layout-resizer";
    document.body.appendChild(resizer);

    let isResizing = false;
    resizer.addEventListener("mousedown", (e) => {
      isResizing = true;
      e.preventDefault();
      document.body.classList.add("is-resizing");
    });

    window.addEventListener("mousemove", (e) => {
      if (!isResizing) return;
      // In a right-docked taskpane, dragging 'left' means increasing width
      // Word taskpanes are usually around 300-400px. 
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth > 280 && newWidth < 800) {
        document.body.style.width = `${newWidth}px`;
      }
    });

    window.addEventListener("mouseup", () => {
      isResizing = false;
      document.body.classList.remove("is-resizing");
    });
  }

  private activeProvider: string | null = null;

  private renderAndRebind() {
    const provider = getAuthProvider();
    if (this.activeProvider !== provider) {
      this.activeProvider = provider;
      this.renderAtomicDesign();
      this.initElements();
      this.bindAuthButtons();
    } else {
      // Just sync simple values if provider didn't change
      this.renderAtomicDesign();
    }
  }

  private bindAuthButtons() {
    if (!this.authController) return;

    this.authController.bindButtons({
      welcomeConnectBtn: document.getElementById("pat-connect-btn"),
      geminiConnectBtn: document.getElementById("gemini-connect-btn"),
      geminiCliConnectBtn: document.getElementById("gemini-cli-connect-btn"),
      geminiApiBtn: document.getElementById("gemini-api-connect-btn"),
      azureConnectBtn: document.getElementById("azure-connect-btn"),
      cliConnectBtn: document.getElementById("cli-connect-btn"),
      oauthConnectBtn: document.getElementById("oauth-login-btn"),
      skipBtn: document.getElementById("skip-login-btn"),
      resetAuthBtn: document.getElementById("reset-auth-btn"),
      reloginBtn: document.getElementById("relogin-btn"),
    });
  }

  private async handleSendMessage() {
    const promptValue = (this.els.promptEl as HTMLTextAreaElement)?.value.trim();
    if (!promptValue || !this.authController) return;

    const ctx: ChatContext = {
      historyEl: this.els.historyEl,
      applyStatus: this.els.applyStatus,
      promptEl: this.els.promptEl as HTMLTextAreaElement,
      sendBtn: this.els.sendBtn as HTMLButtonElement,
      responseEl: null,
      runtimeModel: this.els.runtimeModel,
    };

    try {
      const selectedModel =
        (this.els.modelSelect as HTMLSelectElement)?.value || this.availableModels[0];
      const selectedPreset = getSelectedPreset(
        this.els.presetSelect as HTMLSelectElement,
        this.writingPresets
      );

      setStoredModel(selectedModel);
      setStoredPreset(selectedPreset);

      await this.chatOrchestrator.handleSend(
        promptValue,
        selectedModel,
        selectedPreset,
        this.authController,
        ctx
      );
    } catch (error) {
      console.error("Chat flow failed:", error);
      setApplyStatus(this.els.applyStatus, "發送失敗，請稍後再試");
    }
  }

  private handleClearChat() {
    clearChatHistory(this.els.historyEl);
    showToast(`Conversation Cleared`, "success");
    this.els.promptEl?.focus();
  }
}

Office.onReady((info) => {
  if (info.host === Office.HostType.Word) {
    const controller = new TaskpaneController();
    controller.init();
  }
});
