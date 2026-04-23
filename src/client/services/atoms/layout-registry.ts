/**
 * Atoms: Layout Registry
 * Centralized ID mapping for the entire application layout.
 */

export const NEXUS_SLOTS = {
  APP_ROOT: "nexus-app-root",
  HEADER: "header-root",
  ONBOARDING: "onboarding-root",
  HISTORY: "history-root",
  PROMPT: "prompt-root",
  TOAST: "toast-container"
};

export const NEXUS_IDS = {
  CHAT_HISTORY: "chat-history",
  CHAT_INPUT: "chat-input",
  SEND_BTN: "send-btn",
  APPLY_STATUS: "apply-status",
  AUTH_STATUS: "auth-status",
  PRESET_SELECT: "preset-select",
  MODEL_SELECT: "model-select",
  RUNTIME_MODEL: "runtime-model"
};

export const AUTH_BTN_IDS = {
  PAT: "pat-connect-btn",
  GEMINI: "gemini-connect-btn",
  GEMINI_CLI: "gemini-cli-connect-btn",
  AZURE: "azure-connect-btn",
  CLI: "cli-connect-btn",
  OAUTH: "oauth-login-btn",
  SKIP: "skip-login-btn",
  RELOGIN: "relogin-btn"
};
