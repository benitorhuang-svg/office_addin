/* global document, HTMLInputElement, console */

import { setStoredGeminiToken, getStoredGeminiToken } from "../storage";
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
      const { validateGeminiKey } = await import("../api");
      const validation = await validateGeminiKey(token);

      if (validation.ok) {
        setStoredGeminiToken(token);
        this.ui.showSuccess("Gemini", "Gemini API key is active.");
        this.ui.notifyAssistant("Gemini authentication complete.");
        return true;
      } else {
        this.ui.setStatus(`Error: ${validation.message || "Invalid key"}`);
        return false;
      }
    } catch (error) {
      console.warn(error);
      // Fallback if server is not reachable but user wants to save
      setStoredGeminiToken(token);
      this.ui.showSuccess("Gemini", "Gemini key saved offline. (Validation server unreachable)");
      return true;
    }
  }

  public async handleCliConnect() {
    this.ui.setStatus("Launching Gemini CLI session...");

    try {
      // Trigger the backend to start the CLI (npx @google/gemini-cli --experimental-acp)
      // We don't necessarily need to wait for it to be "ready" as the client will retry connection via ACP
      fetch("/api/gemini/start-cli", { method: "POST" }).catch((e) =>
        console.error("Failed to start Gemini CLI via backend:", e)
      );

      // Switch connection mode to Gemini CLI via ACP
      const s = await import("../storage");
      s.setAuthProvider("gemini_cli");

      // Ensure the model is a Gemini model
      const currentModel = s.getStoredModel();
      if (!currentModel || !currentModel.toLowerCase().includes("gemini")) {
        s.setStoredModel("gemini-1.5-flash");
      }

      // Set a dummy token so other UI pieces know Gemini is selected
      const dummyToken = "local-gemini-session";
      window.localStorage.setItem("gemini_token", dummyToken);

      this.ui.showSuccess("Gemini CLI", "Gemini CLI session active.");
      this.ui.notifyAssistant("Gemini CLI launched.");
      return true;
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
