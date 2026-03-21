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

  public getToken() {
    return getStoredGeminiToken();
  }
}
