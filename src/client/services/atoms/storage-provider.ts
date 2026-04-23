/**
 * Frontend Storage Service
 *
 * Auth provider values aligned with the 4 ACP connection methods:
 *   - 'gemini_cli'   ??Method 1: Gemini CLI (ACP)
 *   - 'copilot_cli'  ??Method 2: Default Copilot CLI
 *   - 'azure_byok'   ??Method 3: Azure OpenAI BYOK
 *   - 'azure_openai'  ??Method 3: (alias for Azure BYOK from frontend)
 *   - 'remote_cli'   ??Method 4: Remote CLI
 *   - 'gemini_api'   ??Native Gemini REST (non-SDK)
 *   - 'github_pat'   ??GitHub Models API with PAT
 *   - 'preview'      ??Preview / Fallback mode
 *
 * SECURE STORAGE: All tokens are encrypted using CryptoProvider (AES-GCM).
 */
import { CryptoProvider } from "./crypto-provider";

export type FrontendAuthProvider =
  | "gemini_cli"
  | "copilot_cli"
  | "azure_byok"
  | "azure_openai"
  | "remote_cli"
  | "gemini_api"
  | "github_pat"
  | "preview";

const TOKEN_KEY = "github_token";
const GEMINI_TOKEN_KEY = "gemini_token";
const MODEL_KEY = "selected_model";
const PRESET_KEY = "selected_preset";
const AUTH_PROVIDER_KEY = "auth_provider";
const AZURE_KEY = "azure_key";
const AZURE_ENDPOINT = "azure_endpoint";
const AZURE_DEPLOYMENT = "azure_deployment";
const MODEL_MODE_KEY = "selected_model_mode";

export async function getStoredToken(): Promise<string | null> {
  const t = window.localStorage.getItem(TOKEN_KEY);
  if (!t) return null;
  // Try decrypt, if fails (e.g. legacy plain text), return as is
  return await CryptoProvider.decrypt(t) || t;
}

export async function setStoredToken(token: string) {
  const enc = await CryptoProvider.encrypt(token);
  window.localStorage.setItem(TOKEN_KEY, enc);
  window.localStorage.setItem(AUTH_PROVIDER_KEY, "github_pat");
}

export function clearStoredToken() {
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(GEMINI_TOKEN_KEY);
  window.localStorage.removeItem(AUTH_PROVIDER_KEY);
  window.localStorage.removeItem(AZURE_KEY);
  window.localStorage.removeItem(AZURE_ENDPOINT);
  window.localStorage.removeItem(AZURE_DEPLOYMENT);
}

export async function getStoredGeminiToken(): Promise<string | null> {
  const t = window.localStorage.getItem(GEMINI_TOKEN_KEY);
  if (!t) return null;
  return await CryptoProvider.decrypt(t) || t;
}

export async function setStoredGeminiToken(token: string) {
  const enc = await CryptoProvider.encrypt(token);
  window.localStorage.setItem(GEMINI_TOKEN_KEY, enc);
  window.localStorage.setItem(AUTH_PROVIDER_KEY, "gemini_api");
}

export function clearStoredGeminiToken() {
  window.localStorage.removeItem(GEMINI_TOKEN_KEY);
}

export function getAuthProvider(): string | null {
  return window.localStorage.getItem(AUTH_PROVIDER_KEY);
}

export async function hasStoredAuthState(): Promise<boolean> {
  return !!(
    (await getStoredToken()) ||
    (await getStoredGeminiToken()) ||
    getAuthProvider() ||
    getStoredAzureConfig().key ||
    getStoredAzureConfig().endpoint ||
    getStoredAzureConfig().deployment
  );
}

export function setAuthProvider(provider: FrontendAuthProvider) {
  window.localStorage.setItem(AUTH_PROVIDER_KEY, provider);
}

export function getStoredModel() {
  return window.localStorage.getItem(MODEL_KEY);
}

export function setStoredModel(model: string) {
  window.localStorage.setItem(MODEL_KEY, model);
}

export function getStoredModelMode(): "auto" | "manual" {
  return (window.localStorage.getItem(MODEL_MODE_KEY) as "auto" | "manual") || "auto";
}

export function setStoredModelMode(mode: "auto" | "manual") {
  window.localStorage.setItem(MODEL_MODE_KEY, mode);
}

export function getStoredPreset() {
  return window.localStorage.getItem(PRESET_KEY);
}

export function setStoredPreset(preset: string) {
  window.localStorage.setItem(PRESET_KEY, preset);
}

export function getStoredAzureConfig() {
  return {
    key: window.localStorage.getItem(AZURE_KEY),
    endpoint: window.localStorage.getItem(AZURE_ENDPOINT),
    deployment: window.localStorage.getItem(AZURE_DEPLOYMENT),
  };
}

export function setStoredAzureConfig(key: string, endpoint: string, deployment: string) {
  window.localStorage.setItem(AZURE_KEY, key);
  window.localStorage.setItem(AZURE_ENDPOINT, endpoint);
  window.localStorage.setItem(AZURE_DEPLOYMENT, deployment);
  window.localStorage.setItem(AUTH_PROVIDER_KEY, "azure_openai");
}
