/**
 * Molecule: Status Banner (Organism Lite)
 * Clean, high-fidelity status and action hub.
 * Re-architected with Atomic Design.
 */
import { createPlusMenu } from "./plus-menu";
import { createContextManager } from "./context-manager";
import { createExpertHub } from "./expert-hub";

export interface StatusBannerProps {
  onClearChat?: () => void;
  onLogout?: () => void;
  onGoHome?: () => void;
}

export function createStatusBanner({ onClearChat, onGoHome }: StatusBannerProps): HTMLElement {
  const banner = document.createElement("div");
  banner.className = "nexus-flex nexus-items-center nexus-justify-between nexus-px-4 nexus-py-2 nexus-border-b nexus-border-slate-100 nexus-bg-white nexus-relative nexus-z-100";

  // --- Left Cluster: Branding + Action
  const left = document.createElement("div");
  left.className = "nexus-flex nexus-items-center nexus-gap-1-5";

  // 1. Branding (Home) - Atomic Atom Edition
  const brandingBtn = document.createElement("button");
  brandingBtn.className = "nexus-brand-home";
  brandingBtn.title = "返回首頁";
  brandingBtn.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
  `;
  brandingBtn.onclick = (e) => { e.stopPropagation(); onGoHome?.(); };
  left.appendChild(brandingBtn);

  // 2. Plus Menu (Atomic Molecule)
  const plusMenuModule = createPlusMenu();
  left.appendChild(plusMenuModule.element);

  // --- Center Hub: System Alerts Slot
  const toastSlot = document.createElement("div");
  toastSlot.id = "nexus-header-toast-slot";
  toastSlot.className = "nexus-flex-1 nexus-flex nexus-justify-center nexus-items-center";

  // --- Right Cluster: Expert Tools
  const right = document.createElement("div");
  right.className = "nexus-flex nexus-items-center nexus-gap-3";

  // 1. Context Manager (Atomic Molecule)
  const contextManager = createContextManager();
  
  // 2. Expert Hub (Atomic Molecule)
  const expertHub = createExpertHub(onClearChat);

  right.appendChild(contextManager.element);
  right.appendChild(expertHub.element);

  // Final Assembly
  banner.appendChild(left);
  banner.appendChild(toastSlot);
  banner.appendChild(right);

  return banner;
}
