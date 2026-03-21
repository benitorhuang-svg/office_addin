/* global document, HTMLInputElement, console */
import { setStoredToken } from "../storage";
import { AuthUIBridge } from "./ui-bridge";

/**
 * Atomic Github Auth Provider.
 * Handles OAuth parsing, local PAT extraction, and dialog lifecycle.
 */
export class GitHubProvider {
  constructor(private ui: AuthUIBridge) {}

  public parseAuthMessage(rawMessage: any) {
    try {
      const parsed = typeof rawMessage === "string" ? JSON.parse(rawMessage) : rawMessage;
      if (parsed?.type === "github-auth") {
        return parsed as { type: "github-auth"; token?: string };
      }
    } catch (error) {
      console.warn(error);
    }
    return null;
  }

  public completeAuth(token: string) {
    setStoredToken(token || "");
    this.ui.showSuccess("GitHub", "GitHub sign-in completed.");
    this.ui.notifyAssistant("Welcome! GitHub authentication complete.");
  }

  public handlePATConnect(inputElId: string) {
    const el = document.getElementById(inputElId) as HTMLInputElement;
    const token = el?.value?.trim();
    if (token) {
      this.completeAuth(token);
      return true;
    }
    return false;
  }

  public handleOAuthConnect() {
    this.ui.setStatus("Initializing GitHub OAuth...");
    
    // Utilize Office Dialog API for true popup auth simulation
    if (typeof Office !== "undefined" && Office.context && Office.context.ui) {
      // Mocking the OAuth server URL. Using taskpane.html to avoid cross-origin blocking in preview.
      const dialogUrl = new URL(window.location.href);
      dialogUrl.searchParams.set("oauth", "github-preview");
      
      Office.context.ui.displayDialogAsync(dialogUrl.href, { height: 60, width: 30 }, (result: any) => {
        if (result.status === Office.AsyncResultStatus.Failed) {
          this.ui.setStatus(`OAuth Dialog Error: ${result.error.message}`);
        } else {
          const dialog = result.value;
          this.ui.setStatus("等待授權回傳... (Simulating OAuth flow)");
          
          // Close dialog and mock success after 2 seconds
          setTimeout(() => {
            dialog.close();
            this.completeAuth("gho_simulated_oauth_token_for_preview");
          }, 2000);
        }
      });
    } else {
      this.ui.setStatus("Office environment not fully ready for OAuth popups.");
    }
  }
}
