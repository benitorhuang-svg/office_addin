/* global document, HTMLInputElement, console */
import { setStoredToken } from "../atoms/storage-provider";

import { AuthStatusProxy } from "../atoms/types";

/**
 * Atomic Github Auth Provider.
 * Handles OAuth parsing, local PAT extraction, and dialog lifecycle.
 */
export class GitHubProvider {
  constructor(private ui: AuthStatusProxy) {}

  public parseAuthMessage(rawMessage: unknown) {
    if (typeof rawMessage === "string" && rawMessage.startsWith("webpackHot")) return null;
    
    try {
      const parsed = typeof rawMessage === "string" ? JSON.parse(rawMessage) : rawMessage;
      if (parsed?.type === "github-auth") {
        return parsed as { type: "github-auth"; token?: string };
      }
    } catch {
      // Intentionally silent
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
        this.ui.showSuccess("GitHub", "GitHub sign-in validated.");
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

    if (typeof Office !== "undefined" && Office.context && Office.context.ui) {
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
            this.ui.setStatus("Waiting for simulated OAuth...");
            setTimeout(() => {
              dialog.close();
              this.completeAuth("gho_simulated_oauth_token");
            }, 2000);
          }
        }
      );
    } else {
      this.ui.setStatus("Office environment not ready for OAuth popups.");
    }
  }
}
