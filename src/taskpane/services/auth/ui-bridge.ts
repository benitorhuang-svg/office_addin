/* global HTMLElement, console */

import { setApplyStatus, setAuthStatus, showMainApp, showOnboarding, appendMessage } from "../molecules/ui-renderer";

export interface AuthUIContext {
  authStatusEl: HTMLElement | null;
  applyStatusEl: HTMLElement | null;
  historyEl: HTMLElement | null;
}

/**
 * Handles all UI transitions during the auth lifecycle.
 */
export class AuthUIBridge {
  constructor(private ctx: AuthUIContext) {}

  public showSuccess(tokenType: string, message: string) {
    showMainApp();
    setAuthStatus(this.ctx.authStatusEl, `Connected (${tokenType})`, true);
    setApplyStatus(this.ctx.applyStatusEl, message);
  }

  public showOnboarding(errorMsg?: string) {
    showOnboarding();
    setAuthStatus(this.ctx.authStatusEl, "Ready");
    if (errorMsg) setApplyStatus(this.ctx.applyStatusEl, errorMsg);
  }

  public notifyAssistant(message: string) {
    appendMessage(this.ctx.historyEl, "assistant", message);
  }

  public reportError(log: string, uiMsg: string) {
    console.error(log);
    setApplyStatus(this.ctx.applyStatusEl, uiMsg);
  }

  public clearStatus() {
    setApplyStatus(this.ctx.applyStatusEl, "");
  }

  public setStatus(message: string) {
    setApplyStatus(this.ctx.applyStatusEl, message);
  }
}
