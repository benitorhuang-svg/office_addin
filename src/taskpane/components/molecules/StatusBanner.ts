import { createStatusDot } from "../atoms/StatusDot";

export interface StatusBannerProps {
  online: boolean;
  provider: string | null;
}

/**
 * Molecule: Status Banner
 * Combines provider name and online status into a readable unit.
 */
export function createStatusBanner({ online, provider }: StatusBannerProps): HTMLElement {
  const banner = document.createElement("div");
  banner.className = "header-status";

  const dot = createStatusDot({ online });

  const methodSpan = document.createElement("span");
  methodSpan.className = "status-method";

  if (provider) {
    let labelName = provider.replace(/_/g, " ").toUpperCase();
    if (provider === "github_pat") labelName = "GITHUB CO-PILOT";
    if (provider === "copilot_cli") labelName = "LOCAL GITHUB CLI";
    if (provider === "gemini_cli") labelName = "LOCAL GEMINI CLI";
    if (provider === "gemini_api") labelName = "GEMINI API KEY";
    if (provider === "preview") labelName = "PREVIEW MODE";

    methodSpan.innerHTML = `<span style="opacity: 0.8">連線方式:</span> <span style="font-weight: 700; color: var(--primary-color)">${labelName}</span>`;
  } else {
    methodSpan.textContent = online ? "Connected - Secure Session" : "Searching for Server...";
  }

  banner.appendChild(dot);
  banner.appendChild(methodSpan);

  return banner;
}
