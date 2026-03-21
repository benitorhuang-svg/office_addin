/* global window */

const TOKEN_KEY = "github_token";
const GEMINI_TOKEN_KEY = "gemini_token";
const MODEL_KEY = "selected_model";
const PRESET_KEY = "selected_preset";
const AUTH_PROVIDER_KEY = "auth_provider";

export function getStoredToken() {
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string) {
  window.localStorage.setItem(TOKEN_KEY, token);
  window.localStorage.setItem(AUTH_PROVIDER_KEY, "github_pat");
}

export function clearStoredToken() {
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(GEMINI_TOKEN_KEY);
  window.localStorage.removeItem(AUTH_PROVIDER_KEY);
}

export function getStoredGeminiToken() {
  return window.localStorage.getItem(GEMINI_TOKEN_KEY);
}

export function setStoredGeminiToken(token: string) {
  window.localStorage.setItem(GEMINI_TOKEN_KEY, token);
  window.localStorage.setItem(AUTH_PROVIDER_KEY, "gemini_api");
}

export function getAuthProvider(): string | null {
  return window.localStorage.getItem(AUTH_PROVIDER_KEY);
}

export function setAuthProvider(provider: "github_pat" | "gemini_api" | "copilot_cli" | "preview") {
  window.localStorage.setItem(AUTH_PROVIDER_KEY, provider);
}

export function getStoredModel() {
  return window.localStorage.getItem(MODEL_KEY);
}

export function setStoredModel(model: string) {
  window.localStorage.setItem(MODEL_KEY, model);
}

export function getStoredPreset() {
  return window.localStorage.getItem(PRESET_KEY);
}

export function setStoredPreset(preset: string) {
  window.localStorage.setItem(PRESET_KEY, preset);
}
