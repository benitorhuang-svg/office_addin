import { createStatusDot } from "../atoms/StatusDot";

export interface StatusBannerProps {
  online: boolean;
  provider: string | null;
  onClearChat?: () => void;
}

/**
 * Molecule: Status Banner
 * Combines provider name and online status into a readable unit.
 */
export function createStatusBanner({ online, provider, onClearChat }: StatusBannerProps): HTMLElement {
  const banner = document.createElement("div");
  banner.className = "flex items-center justify-between w-full px-5 py-4 bg-white/40 backdrop-blur-xl border-b border-white/20";

  // Left side: Branding & Status
  const left = document.createElement("div");
  left.className = "flex items-center gap-3";
  
  const dot = createStatusDot({ online });
  left.appendChild(dot);

  const brand = document.createElement("div");
  brand.className = "flex flex-col";
  
  const title = document.createElement("h2");
  title.className = "text-sm font-bold font-outfit text-slate-900 tracking-tight leading-none mb-1";
  title.textContent = "office_Agent";
  
  const statusInfo = document.createElement("p");
  statusInfo.className = "text-[9px] uppercase tracking-widest font-bold text-slate-400";
  
  if (provider) {
    let labelName = provider.replace(/_/g, " ").toUpperCase();
    if (provider === "github_pat") labelName = "GITHUB COPILOT";
    else if (provider === "copilot_cli") labelName = "LOCAL CLI";
    else if (provider === "gemini_cli") labelName = "GEMINI CLI";
    else if (provider === "gemini_api") labelName = "GEMINI API";
    else if (provider === "preview") labelName = "PREVIEW ONLY";
    statusInfo.textContent = labelName;
  } else {
    statusInfo.textContent = online ? "CONNECTED" : "OFFLINE";
  }
  
  brand.appendChild(title);
  brand.appendChild(statusInfo);
  left.appendChild(brand);
  banner.appendChild(left);

  // Right side: Actions
  const actions = document.createElement("div");
  actions.className = "flex items-center gap-2";

  const clearBtn = document.createElement("button");
  clearBtn.id = "clear-chat-btn";
  clearBtn.className = "p-2 rounded-xl text-slate-500 hover:bg-white/50 hover:text-blue-600 transition-all duration-300 transform active:scale-90";
  clearBtn.title = "Start New Chat";
  clearBtn.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  `;
  if (onClearChat) clearBtn.onclick = onClearChat;
  actions.appendChild(clearBtn);
  banner.appendChild(actions);

  return banner;
}
