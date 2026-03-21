/* global document, requestAnimationFrame, setTimeout, HTMLElement, HTMLSelectElement, HTMLButtonElement */

import { WritingPreset } from "../types";

import { createChatBubble } from "../components/molecules/ChatBubble";
import { createTypingIndicator } from "../components/molecules/TypingIndicator";

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

  const preferredModel = selectedModel || models[0] || "GPT-5 mini";
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
    loadingScreen.classList.add("fade-out");
    setTimeout(() => {
      loadingScreen.style.display = "none";
    }, 500);
  }
}

export function showMainApp() {
  const onboardingRoot = document.getElementById("onboarding-root");
  const appBody = document.getElementById("app-body");

  if (onboardingRoot) onboardingRoot.style.display = "none";
  if (appBody) {
    appBody.style.display = "flex";
    appBody.classList.add("fade-in");
    
    // Ensure the chat history starts at the top
    const historyEl = document.getElementById("chat-history");
    if (historyEl) historyEl.scrollTop = 0;
  }
}

export function showOnboarding() {
  const onboardingRoot = document.getElementById("onboarding-root");
  const appBody = document.getElementById("app-body");

  if (onboardingRoot) onboardingRoot.style.display = "flex";
  if (appBody) appBody.style.display = "none";
}

export function updateWelcomeForPatMode() {
  const welcomeBtn = document.getElementById("welcome-connect-btn") as HTMLButtonElement | null;
  const skipLink = document.getElementById("skip-login-btn");
  const subtitle = document.querySelector(".onboarding-subtitle") as HTMLElement | null;

  if (welcomeBtn) {
    welcomeBtn.textContent = "Start with Local PAT";
  }
  if (skipLink) {
    skipLink.textContent = "Enter Preview Mode";
  }
  if (subtitle) {
    subtitle.textContent = "Server PAT detected. Local configuration is ready for use.";
  }
}

export function clearChatHistory(historyEl: HTMLElement | null, responseEl: HTMLElement | null) {
  if (historyEl) {
    historyEl.innerHTML = `
      <div class="welcome-message-container">
          <div class="welcome-header">
            歡迎使用文案助手
          </div>
          <div class="welcome-capabilities">
             <div class="capability-item">📝 撰寫、編輯文件內容</div>
             <div class="capability-item">💡 延伸主題、提煉賣點</div>
             <div class="capability-item">📊 建立表格、清單結構</div>
             <div class="capability-item">🎨 格式化文字與排版</div>
          </div>
          <div class="welcome-footer">
            請告訴我你想寫什麼，或直接貼上需要修改的內容，我們開始吧！
          </div>
      </div>
    `;
  }
  if (responseEl) {
    responseEl.textContent = "";
  }
}
