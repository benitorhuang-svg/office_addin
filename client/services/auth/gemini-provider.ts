/* global window, document, HTMLInputElement, console */
import { clearStoredGeminiToken, setStoredGeminiToken, getStoredGeminiToken } from "../atoms/storage-provider";

import { AuthStatusProxy } from "../atoms/types";

/**
 * Atomic Gemini Auth Provider.
 * Focuses on API key lifecycle for Google Gemini.
 */
export class GeminiProvider {
  constructor(private ui: AuthStatusProxy) {}

  public async handleConnect(inputElId: string) {
    const el = document.getElementById(inputElId) as HTMLInputElement;
    const token = el?.value?.trim();

    if (!token) {
      this.ui.setStatus("Please enter a Gemini API key.");
      return false;
    }

    setStoredGeminiToken(token);
    const { setAuthProvider } = await import("../atoms/storage-provider");
    setAuthProvider("gemini_api");
    this.ui.showSuccess("Gemini", "Gemini key saved. Validation in background.");
    this.ui.notifyAssistant("Gemini authentication stored.");

    (async () => {
      try {
        const { validateGeminiApiKey } = await import("../organisms/api-orchestrator");
        const val = await validateGeminiApiKey(token);
        if (!val.ok) {
          this.ui.setStatus(`Gemini validation failed: ${val.message}`);
        } else {
          this.ui.setStatus("Gemini key validated.");
        }
      } catch (err) {
        console.warn("Background validation failed", err);
      }
    })();

    return true;
  }

  public async handleCliConnect() {
    const remoteUrl = window.localStorage.getItem("REMOTE_SERVER_URL");
    const modeName = remoteUrl ? "Cloud Run Server" : "Local CLI Bridge";
    this.ui.setStatus(`Detecting Gemini session on ${modeName}...`);

    try {
      const { validateACPToken } = await import("../organisms/api-orchestrator");
      const { resolveLocalServerOrigin } = await import("../molecules/local-server-resolver");
      
      const origin = await resolveLocalServerOrigin();
      const isActuallyLocal = origin.includes("localhost") || origin.includes("127.0.0.1");

      const val = await validateACPToken("gemini", "");

      if (val.ok) {
        const s = await import("../atoms/storage-provider");
        clearStoredGeminiToken();
        s.setAuthProvider("gemini_cli");

        const currentModel = s.getStoredModel();
        if (!currentModel || !currentModel.toLowerCase().includes("gemini")) {
          s.setStoredModel("gemini-1.5-flash");
        }

        const successTitle = remoteUrl ? "Cloud Gemini" : "Gemini CLI";
        this.ui.showSuccess(successTitle, `${modeName} session active.`);
        this.ui.notifyAssistant(`${successTitle} launched.`);
        return true;
      } else {
        const errorMsg = !isActuallyLocal ? "Bridge server not found." : val.message;
        this.ui.setStatus(`${modeName} Error: ${errorMsg}`);
        return false;
      }
    } catch (err) {
      console.error(err);
      this.ui.setStatus(`Failed to trigger ${modeName}.`);
      return false;
    }
  }

  public getToken() {
    return getStoredGeminiToken();
  }
}
