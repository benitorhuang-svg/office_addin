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

    this.ui.setStatus("Validating Gemini key...");

    try {
      const { validateGeminiApiKey } = await import("../organisms/api-orchestrator");
      const compilationOk = await validateGeminiApiKey(token);

      if (compilationOk.ok) {
        setStoredGeminiToken(token);
        const { setAuthProvider } = await import("../atoms/storage-provider");
        setAuthProvider("gemini_api");
        this.ui.showSuccess("Gemini", "Connected to Gemini API via REST.");
        this.ui.notifyAssistant("Gemini authentication complete.");
        return true;
      } else {
        this.ui.setStatus(`Error: ${compilationOk.message || "Invalid key"}`);
        return false;
      }
    } catch (error) {
      console.warn(error);
      // Fallback if server is not reachable but user wants to save
      setStoredGeminiToken(token);
      const { setAuthProvider } = await import("../atoms/storage-provider");
      setAuthProvider("gemini_api");
      this.ui.showSuccess("Gemini", "Gemini key saved offline. (Validation server unreachable)");
      return true;
    }
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
