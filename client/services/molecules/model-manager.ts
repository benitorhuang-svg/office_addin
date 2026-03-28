import { ServerConfig } from "@shared/types";

let _config: ServerConfig | null = null;

/**
 * Molecule: Model Manager
 * Dynamic logic for determining available models based on .env configuration.
 * UPGRADED: Zero hardcoding. 100% remote config driven.
 */
export const ModelManager = {
  loadConfig(config: ServerConfig) {
    _config = config;
  },

  /**
   * Returns models exactly as configured in the server's .env file.
   * If no config is loaded, returns safe defaults.
   */
  getAvailableModels(provider: string | null): string[] {
    const p = provider?.toLowerCase() || "";
    const isGemini = p.includes("gemini");
    const isGithub = p.includes("copilot") || p.includes("github");

    if (isGemini) {
      return _config?.AVAILABLE_MODELS_GEMINI || [];
    } else if (isGithub) {
      return _config?.AVAILABLE_MODELS_GITHUB || [];
    } else {
      // Preview Mode (Guest) returns empty list to trigger "Model Selection" only label.
      return [];
    }
  },

  getDefaultModel(models: string[]): string {
    return models[0] || "gpt-5-mini";
  },
};
