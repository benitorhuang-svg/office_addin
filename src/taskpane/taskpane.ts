/* eslint-disable no-undef */
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
  getStoredPreset,
  setStoredPreset,
} from "./services/storage";
import { FALLBACK_PRESETS, getSelectedPreset } from "./services/presets";
import { ChatOrchestrator, ChatContext } from "./services/chat-orchestrator";
import { WritingPreset } from "./types";

import { createHeader } from "./components/organisms/Header";
import { createHistoryContainer } from "./components/organisms/HistoryContainer";
import { createOnboardingOrganism } from "./components/organisms/Onboarding";
import { createPromptGroup } from "./components/molecules/PromptGroup";

/**
 * TaskpaneController
 *
 * Central orchestrator for the office_Agent taskpane.
 * Follows Atomic Design for components and delegates logic to services.
 */
class TaskpaneController {
  private els!: Record<string, HTMLElement | null>;
  private authController!: ReturnType<typeof createAuthController>;
  private chatOrchestrator: ChatOrchestrator;
  private writingPresets: WritingPreset[] = [...FALLBACK_PRESETS];
  private availableModels: string[] = ["GPT-4o mini", "GPT-5 mini", "Gemini 1.5 Pro"];

  constructor() {
    this.chatOrchestrator = new ChatOrchestrator();
    this.renderAtomicDesign();
    this.initElements();
  }

  private renderAtomicDesign() {
    const onboardingRoot = document.getElementById("onboarding-root");
    if (onboardingRoot) onboardingRoot.appendChild(createOnboardingOrganism());

    const headerRoot = document.getElementById("header-root");
    if (headerRoot) {
      headerRoot.appendChild(
        createHeader({
          title: "office_Agent",
        })
      );
    }

    // Mount into the history-root and prompt-root containers
    const historyRoot = document.getElementById("history-root");
    if (historyRoot) {
      historyRoot.appendChild(createHistoryContainer());
    }

    const promptRoot = document.getElementById("prompt-root");
    if (promptRoot) {
      promptRoot.appendChild(
        createPromptGroup({
          onSend: () => this.handleSendMessage(),
          onClearChat: () => this.handleClearChat(),
          availableModels: this.availableModels,
          selectedModel: getStoredModel() || this.availableModels[0],
          onModelChange: (m) => this.handleModelChange(m),
          onLogout: () => this.authController?.logout(),
        })
      );
    }
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
    this.authController = createAuthController({
      authStatusEl: document.getElementById("auth-status"),
      applyStatusEl: this.els.applyStatus,
      historyEl: this.els.historyEl,
    });

    // Bind buttons for the onboarding flow
    this.authController.bindButtons({
      welcomeConnectBtn: document.getElementById("pat-connect-btn"),
      geminiConnectBtn: document.getElementById("gemini-connect-btn"),
      geminiApiBtn: document.getElementById("gemini-api-connect-btn"),
      azureConnectBtn: document.getElementById("azure-connect-btn"),
      cliConnectBtn: document.getElementById("cli-connect-btn"),
      oauthConnectBtn: document.getElementById("oauth-login-btn"),
      skipBtn: document.getElementById("skip-login-btn"),
      resetAuthBtn: document.getElementById("reset-auth-btn"),
      reloginBtn: document.getElementById("relogin-btn"),
    });

    await this.authController.checkInitialAuth();

    // Initial UI state
    const currentPreset = getStoredPreset() || "generic";
    setPresetDescription(this.els.presetDescription, currentPreset, this.writingPresets);

    // Focus the prompt for a ready-to-type experience
    this.els.promptEl?.focus();

    // CRITICAL: Hide loading screen after all initialization and auth checks are done
    hideLoadingScreen();
    startHealthCheck();
  }

  private async handleSendMessage() {
    const prompt = (this.els.promptEl as HTMLTextAreaElement)?.value.trim() || "";
    if (!prompt) return;

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
        prompt,
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

  private handleModelChange(m: string) {
    setStoredModel(m);
    showToast(`Model set to ${m}`, "info");
  }

  private handlePresetChange(p: string) {
    setStoredPreset(p);
    setPresetDescription(this.els.presetDescription, p, this.writingPresets);
    showToast(`Mode: ${p}`, "info");
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
