

/**
 * Molecule: Model Manager
 * Logic for determining available models based on auth provider and mode.
 */
export const ModelManager = {
  getAvailableModels(provider: string | null): string[] {
    if (provider?.includes("gemini")) {
      return ["gemini-2.5-flash", "gemini-2.5-pro", "gemini-3.1-pro", "gemini-3.1-flash", "gemini-3.1-flash-lite"];
    } else if (provider === "github_pat" || provider === "copilot_cli" || provider === "github_oauth") {
      return ["gpt-5-mini", "gpt-5.4-mini", "gpt-5.4", "claude sonnet 4.6"];
    } else {
      return ["gpt-5-mini", "gemini-2.5-flash"];
    }
  },

  getDefaultModel(models: string[]): string {
    return models[0] || "gpt-5-mini";
  },
};
