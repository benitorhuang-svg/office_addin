import { getStoredModelMode } from "../storage";

/**
 * Molecule: Model Manager
 * Logic for determining available models based on auth provider and mode.
 */
export const ModelManager = {
  getAvailableModels(provider: string | null): string[] {
    const mode = getStoredModelMode();

    if (provider?.includes("gemini")) {
      if (mode === "auto") {
        return ["Auto (Gemini 2.5)", "Auto (Gemini 1.5)"];
      } else {
        return ["Gemini 2.0 Flash", "Gemini 1.5 Pro", "Gemini 1.5 Flash"];
      }
    } else if (provider === "github_pat" || provider === "copilot_cli") {
      return ["GPT-4o", "GPT-4 Turbo", "GPT-4o mini"];
    } else {
      return ["GPT-4o mini", "Gemini 1.5 Flash"];
    }
  },

  getDefaultModel(models: string[]): string {
    return models[0] || "GPT-4o mini";
  },
};
