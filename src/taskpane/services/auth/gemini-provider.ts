/* global document, HTMLInputElement, console */

import { clearStoredGeminiToken, setStoredGeminiToken, getStoredGeminiToken } from "../atoms/storage-provider";
import { AuthUIBridge } from "./ui-bridge";

/**
 * Atomic Gemini Auth Provider.
 * Focuses on API key lifecycle for Google Gemini.
 */
export class GeminiProvider {
  constructor(private ui: AuthUIBridge) {}

  public async handleConnect(inputElId: string) {
    const el = document.getElementById(inputElId) as HTMLInputElement;
    const token = el?.value?.trim();

    if (!token) {
      this.ui.setStatus("Please enter a Gemini API key.");
      return false;
    }

    // Optimistic save: store token and return immediately, validate in background
    setStoredGeminiToken(token);
    const { setAuthProvider } = await import("../atoms/storage-provider");
    setAuthProvider("gemini_api");
    this.ui.showSuccess("Gemini", "Gemini key saved. Validation running in background.");
    this.ui.notifyAssistant("Gemini authentication stored. Background validation started.");

    // Background validation (does not block the UI)
    (async () => {
      try {
        const { validateGeminiApiKey } = await import("../organisms/api-orchestrator");
        const val = await validateGeminiApiKey(token);
        if (!val.ok) {
          this.ui.setStatus(`Gemini validation failed: ${val.message}`);
        } else {
          // brief positive status update
          this.ui.setStatus("Gemini key validated.");
        }
      } catch (err) {
        console.warn("Background Gemini validation failed", err);
        // leave the saved token intact; user can retry validation later
      }
    })();

    return true;
  }

  public async handleCliConnect() {
    this.ui.setStatus("Detecting Gemini CLI session via ACP...");

    try {
      const { validateACPToken } = await import("../organisms/api-orchestrator");
      const val = await validateACPToken("gemini", "");

      if (val.ok) {
        // Switch connection mode to Gemini CLI via ACP
        const s = await import("../atoms/storage-provider");
        clearStoredGeminiToken();
        s.setAuthProvider("gemini_cli");

        // Ensure the model is a Gemini model
        const currentModel = s.getStoredModel();
        if (!currentModel || !currentModel.toLowerCase().includes("gemini")) {
          s.setStoredModel("gemini-1.5-flash");
        }

        this.ui.showSuccess("Gemini CLI", "Gemini CLI session active.");
        this.ui.notifyAssistant("Gemini CLI launched and validated.");
        return true;
      } else {
        this.ui.setStatus(`Gemini CLI Error: ${val.message}`);
        return false;
      }
    } catch (err) {
      console.error(err);
      this.ui.setStatus("Failed to trigger Gemini CLI.");
      return false;
    }
  }

  public getToken() {
    return getStoredGeminiToken();
  }
}
