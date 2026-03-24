import { WritingPreset } from "../atoms/types";

import { createChatBubble } from "../../components/molecules/ChatBubble";
import { createTypingIndicator } from "../../components/molecules/TypingIndicator";
import { createWelcomeMessage } from "../../components/molecules/WelcomeMessage";

export function appendMessage(
  historyEl: HTMLElement | null,
  role: "user" | "assistant",
  text: string,
  onApply?: () => void
): HTMLElement | null {
  if (!historyEl) return null;

  const bubble = createChatBubble({ role, text, onApply });
  historyEl.appendChild(bubble);

  // Smooth scroll to bottom
  requestAnimationFrame(() => {
    historyEl.scrollTo({
      top: historyEl.scrollHeight,
      behavior: "smooth",
    });
  });

  return bubble;
}

export function showTypingIndicator(historyEl: HTMLElement | null) {
  if (!historyEl) return;
  const indicator = createTypingIndicator();
  historyEl.appendChild(indicator);
  historyEl.scrollTo({ top: historyEl.scrollHeight, behavior: "smooth" });
}

export function removeTypingIndicator() {
  const indicator = document.getElementById("typing-indicator");
  if (indicator) indicator.remove();
}

export function setAuthStatus(authStatus: HTMLElement | null, text: string, connected = false) {
  if (!authStatus) return;
  authStatus.textContent = text;
  authStatus.classList.toggle("connected", connected);
}

export function setRuntimeModel(runtimeModel: HTMLElement | null, model?: string) {
  if (!runtimeModel) return;
  runtimeModel.textContent = model || "Unknown";
}

export function setApplyStatus(applyStatus: HTMLElement | null, text: string) {
  if (!applyStatus) return;
  applyStatus.textContent = text;
  if (text) {
    applyStatus.classList.remove("hidden");
  } else {
    applyStatus.classList.add("hidden");
  }
}

export function setPresetDescription(
  presetDescription: HTMLElement | null,
  presetId: string,
  writingPresets: WritingPreset[]
) {
  if (!presetDescription) return;
  const preset = writingPresets.find((item) => item.id === presetId);
  presetDescription.textContent = preset ? preset.description : "";
}

export function populateModelOptions(
  modelSelect: HTMLSelectElement | null,
  models: string[],
  selectedModel?: string
) {
  if (!modelSelect) return;
  modelSelect.innerHTML = "";

  const preferredModel = selectedModel || models[0] || "No Model Available";
  models.forEach((model) => {
    const option = document.createElement("option");
    option.value = model;
    option.textContent = model;
    if (model === preferredModel) option.selected = true;
    modelSelect.appendChild(option);
  });
}

export function hideLoadingScreen() {
  const loadingScreen = document.getElementById("loading-screen");
  if (loadingScreen) {
    loadingScreen.classList.add("opacity-0", "transition-opacity", "duration-500");
    setTimeout(() => {
      loadingScreen.remove();
    }, 500);
  }
}

export function showMainApp() {
  const onboardingRoot = document.getElementById("onboarding-root");
  const appBody = document.getElementById("app-body");

  // Hide onboarding
  if (onboardingRoot) {
    onboardingRoot.classList.add("opacity-0", "pointer-events-none");
    setTimeout(() => { onboardingRoot.style.display = "none"; }, 700);
  }
  
  // Show main app
  if (appBody) {
    appBody.style.display = "flex";
    requestAnimationFrame(() => {
      appBody.classList.remove("opacity-0");
      appBody.classList.add("opacity-100");
    });

    const historyEl = document.getElementById("chat-history");
    if (historyEl) historyEl.scrollTop = 0;
  }
}

export function showOnboarding() {
  const onboardingRoot = document.getElementById("onboarding-root");
  const appBody = document.getElementById("app-body");

  // Show onboarding
  if (onboardingRoot) {
    onboardingRoot.style.display = "flex";
    requestAnimationFrame(() => {
      onboardingRoot.classList.remove("opacity-0", "pointer-events-none");
      onboardingRoot.classList.add("opacity-100", "pointer-events-auto");
    });
  }

  // Hide main app
  if (appBody) {
    appBody.classList.add("opacity-0");
    appBody.classList.remove("opacity-100");
    setTimeout(() => { appBody.style.display = "none"; }, 700);
  }
}

export function updateWelcomeForPatMode() {
  const skipLink = document.getElementById("skip-login-btn");
  if (skipLink) {
    skipLink.textContent = "Continue with Server PAT →";
  }
}

export function showToast(message: string, type: "info" | "success" | "error" = "info") {
  const toast = document.createElement("div");
  // Modern Floating Toast
  const bgColor = type === "success" ? "bg-emerald-600 shadow-emerald-500/20" : type === "error" ? "bg-red-600 shadow-red-500/20" : "bg-slate-900 shadow-slate-900/20";
  
  toast.className = `fixed top-6 left-1/2 -translate-x-1/2 z-[60] px-6 py-2.5 rounded-2xl text-white text-xs font-bold shadow-2xl transition-all duration-500 transform -translate-y-8 opacity-0 pointer-events-none ${bgColor}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  requestAnimationFrame(() => {
    toast.classList.remove("-translate-y-8", "opacity-0");
    toast.classList.add("translate-y-0", "opacity-100");
  });

  setTimeout(() => {
    toast.classList.add("-translate-y-8", "opacity-0");
    setTimeout(() => toast.remove(), 500);
  }, 3500);
}

export function startHealthCheck() {
  const check = async () => {
    try {
      const { getConfig } = await import("../organisms/api-orchestrator");
      await getConfig();
      document.body.classList.remove("server-offline");
    } catch {
      document.body.classList.add("server-offline");
    }
  };
  check();
  setInterval(check, 30000);
}

export function clearChatHistory(
  historyEl: HTMLElement | null,
  responseEl: HTMLElement | null = null,
  authProvider: string | null = null
) {
  if (historyEl) {
    historyEl.innerHTML = "";
    historyEl.appendChild(createWelcomeMessage({ authProvider }));
  }
  if (responseEl) {
    responseEl.textContent = "";
  }
}
