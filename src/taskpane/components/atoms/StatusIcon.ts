/**
 * Atom: StatusIcon
 * Renders various status indicators (check, loading, error).
 */

export type StatusType = "pending" | "loading" | "success" | "error";

export function createStatusIcon(status: StatusType, size: number = 16): HTMLElement {
  const icon = document.createElement("div");
  icon.className = `atom-status-icon ${status}`;
  icon.style.width = `${size}px`;
  icon.style.height = `${size}px`;

  switch (status) {
    case "success":
      icon.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
      break;
    case "loading":
      icon.innerHTML = `<div class="spinner-dot"></div>`;
      break;
    case "error":
      icon.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
      break;
    case "pending":
      icon.style.border = "1.5px solid #ccc";
      icon.style.borderRadius = "50%";
      break;
  }

  return icon;
}
