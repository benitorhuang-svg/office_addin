const TOKEN_KEY = "github_token";
const GEMINI_TOKEN_KEY = "gemini_token";
const MODEL_KEY = "selected_model";
const PRESET_KEY = "selected_preset";

export function getStoredToken() {
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string) {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken() {
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(GEMINI_TOKEN_KEY);
}

export function getStoredGeminiToken() {
  return window.localStorage.getItem(GEMINI_TOKEN_KEY);
}

export function setStoredGeminiToken(token: string) {
  window.localStorage.setItem(GEMINI_TOKEN_KEY, token);
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
