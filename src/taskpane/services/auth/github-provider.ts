/* global document, HTMLInputElement, console */
import { setStoredToken } from "../atoms/storage-provider";
import { AuthUIBridge } from "./ui-bridge";

/**
 * Atomic Github Auth Provider.
 * Handles OAuth parsing, local PAT extraction, and dialog lifecycle.
 */
export class GitHubProvider {
  constructor(private ui: AuthUIBridge) {}

  public parseAuthMessage(rawMessage: unknown) {
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

  public async completeAuth(token: string) {
    this.ui.setStatus("Validating token via ACP...");
    try {
      const { validateACPToken } = await import("../organisms/api-orchestrator");
      const val = await validateACPToken("copilot", token);
      
      if (val.ok) {
        setStoredToken(token || "");
        this.ui.showSuccess("GitHub", "GitHub sign-in completed and validated.");
        this.ui.notifyAssistant("Welcome! GitHub authentication complete.");
      } else {
        this.ui.setStatus(`Error: ${val.message || "Invalid authentication token."}`);
      }
    } catch(e) {
      console.warn("Validation fallback:", e);
      setStoredToken(token || "");
      this.ui.showSuccess("GitHub", "GitHub sign-in (Offline fallback).");
    }
  }

  public async handlePATConnect(inputElId: string) {
    const el = document.getElementById(inputElId) as HTMLInputElement;
    const token = el?.value?.trim();
    if (!token) {
      this.ui.setStatus("Please enter a GitHub PAT or token.");
      return false;
    }
    
    await this.completeAuth(token);
    return true;
  }

  public handleOAuthConnect() {
    this.ui.setStatus("Initializing GitHub OAuth...");

    // Utilize Office Dialog API for true popup auth simulation
    if (typeof Office !== "undefined" && Office.context && Office.context.ui) {
      // Mocking the OAuth server URL. Using taskpane.html to avoid cross-origin blocking in preview.
      const dialogUrl = new URL(window.location.href);
      dialogUrl.searchParams.set("oauth", "github-preview");

      Office.context.ui.displayDialogAsync(
        dialogUrl.href,
        { height: 60, width: 30 },
        (result: Office.AsyncResult<Office.Dialog>) => {
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
        }
      );
    } else {
      this.ui.setStatus("Office environment not fully ready for OAuth popups.");
    }
  }
}
