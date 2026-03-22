import { createAuthController } from "./services/auth";
import {
  setApplyStatus,
  clearChatHistory,
  setPresetDescription,
  hideLoadingScreen,
  startHealthCheck,
  showToast,
} from "./services/ui";
import {
  getStoredModel,
  setStoredModel,
  getStoredModelMode,
  setStoredModelMode,
  getStoredPreset,
  setStoredPreset,
  getAuthProvider,
} from "./services/storage";
import { FALLBACK_PRESETS, getSelectedPreset } from "./services/presets";
import { ChatOrchestrator } from "./services/chat-orchestrator";
import { WritingPreset, ChatContext, AuthController } from "./types";
import { ModelManager } from "./services/molecules/model-manager";

import { createHeader } from "./components/organisms/Header";
import { createHistoryContainer } from "./components/organisms/HistoryContainer";
import { createOnboardingOrganism } from "./components/organisms/Onboarding";
import { createPromptGroup } from "./components/molecules/PromptGroup";

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
  private renderAtomicDesign() {
    const provider = getAuthProvider();
    this.availableModels = ModelManager.getAvailableModels(provider);

    // 1. Render Onboarding
    const onboardingRoot = document.getElementById("onboarding-root");
    if (onboardingRoot) {
      onboardingRoot.innerHTML = "";
      onboardingRoot.appendChild(createOnboardingOrganism());
    }

    // 2. Render Header
    const headerRoot = document.getElementById("header-root");
    if (headerRoot) {
      headerRoot.innerHTML = "";
      headerRoot.appendChild(
        createHeader({
          title: "office_Agent",
          authProvider: provider,
        })
      );
    }

    // 3. Render History
    const historyRoot = document.getElementById("history-root");
    if (historyRoot) {
      historyRoot.innerHTML = "";
      historyRoot.appendChild(createHistoryContainer({ authProvider: provider }));
    }

    // 4. Render Prompt Controls
    const promptRoot = document.getElementById("prompt-root");
    if (promptRoot) {
      promptRoot.innerHTML = "";
      promptRoot.appendChild(
        createPromptGroup({
          onSend: () => this.handleSendMessage(),
          onClearChat: () => this.handleClearChat(),
          availableModels: this.availableModels,
          selectedModel: getStoredModel() || ModelManager.getDefaultModel(this.availableModels),
          modelMode: getStoredModelMode(),
          onModelChange: (m) => this.handleModelChange(m),
          onModeChange: (mode) => this.handleModeChange(mode),
          onLogout: () => this.authController?.logout(),
        })
      );
    }
  }

  private handleModeChange(mode: 'auto' | 'manual') {
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
    this.renderAtomicDesign();
    this.initElements();

    this.authController = createAuthController({
      authStatusEl: document.getElementById("auth-status"),
      applyStatusEl: this.els.applyStatus,
      historyEl: this.els.historyEl,
    }, {
      onAuthStateChanged: () => {
        this.renderAndRebind();
      }
    });

    this.bindAuthButtons();
    await this.authController.checkInitialAuth();

    // Re-render and re-bind to sync UI with state
    this.renderAndRebind();

    // Initial Static UI settings
    const currentPreset = getStoredPreset() || "generic";
    setPresetDescription(this.els.presetDescription, currentPreset, this.writingPresets);

    // Initial Flow: focus and cleanup loading
    this.els.promptEl?.focus();
    window.scrollTo(0, 0);
    hideLoadingScreen();
    startHealthCheck();
  }

  private renderAndRebind() {
    this.renderAtomicDesign();
    this.initElements();
    this.bindAuthButtons();
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
    if (!promptValue) return;

    const ctx: ChatContext = {
      historyEl: this.els.historyEl,
      applyStatus: this.els.applyStatus,
      promptEl: this.els.promptEl as HTMLTextAreaElement,
      sendBtn: this.els.sendBtn as HTMLButtonElement,
      responseEl: null,
      runtimeModel: this.els.runtimeModel,
    };

    try {
      const selectedModel = (this.els.modelSelect as HTMLSelectElement)?.value || this.availableModels[0];
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
