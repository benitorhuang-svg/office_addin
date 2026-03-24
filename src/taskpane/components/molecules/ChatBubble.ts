/* global document, navigator, HTMLElement */

import { createButton } from "../atoms/Button";

export interface ChatBubbleProps {
  role: "user" | "assistant";
  text: string;
  onApply?: () => void;
}

export function createChatBubble({ role, text, onApply }: ChatBubbleProps): HTMLElement {
  const container = document.createElement("div");
  container.className = `mol-chat-bubble ${role === "assistant" ? "assistant-card" : ""} flex flex-col w-full space-y-1.5 animate-in fade-in slide-in-from-bottom-2 duration-500 ${
    role === "user" ? "max-w-[85%] ml-auto items-end text-right" : "items-start text-left"
  }`;

  // 1. Label/Icon Row
  const header = document.createElement("div");
  header.className = `flex items-center gap-1.5 px-1 ${role === "user" ? "flex-row-reverse" : "flex-row"}`;
  
  const icon = document.createElement("div");
  icon.className = `w-5 h-5 flex items-center justify-center rounded-lg ${
    role === "user" ? "bg-blue-100 text-blue-600" : "bg-indigo-100 text-indigo-600"
  }`;
  icon.innerHTML = role === "user" 
    ? `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`
    : `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"></path><path d="M12 6v6l4 2"></path></svg>`;
  
  const roleLabel = document.createElement("span");
  roleLabel.className = "text-[10px] font-bold uppercase tracking-widest text-slate-400";
  roleLabel.textContent = role === "user" ? "YOU" : "Agent";
  
  header.appendChild(icon);
  header.appendChild(roleLabel);
  container.appendChild(header);

  // 2. Content Area
  const content = document.createElement("div");
  
  if (role === "assistant") {
    container.dataset.fullText = text;
    content.className = "w-full glass-card p-5 space-y-3 shadow-sm hover:shadow-md transition-shadow duration-300";
    
    // Preview area (Markdown enabled)
    const preview = document.createElement("div");
    preview.className = "text-preview text-sm text-slate-800";
    if (!text || !text.trim()) {
      preview.classList.add("skeleton");
      preview.textContent = "";
    } else {
      preview.textContent = text;
    }
    content.appendChild(preview);

    const footer = document.createElement("div");
    footer.className = "bubble-footer flex items-center gap-2 pt-3 border-t border-slate-100";
    footer.style.display = text.trim() ? "flex" : "none";
    
    const applyBtn = createButton({
      label: "Apply to Word",
      className: "px-4 py-2 text-xs bg-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-500/10",
    });
    if (onApply) applyBtn.onclick = onApply;

    const copyBtn = createButton({
      label: "Copy",
      className: "px-4 py-2 text-xs bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200",
    });
    copyBtn.onclick = () => {
      const raw = container.dataset.fullText || text;
      const clean = raw.replace(/<[^>]*>?/gm, '').replace(/\**/g, '');
      navigator.clipboard.writeText(clean);
      copyBtn.textContent = "Copied!";
      setTimeout(() => { copyBtn.textContent = "Copy"; }, 1500);
    };

    footer.appendChild(applyBtn);
    footer.appendChild(copyBtn);
    content.appendChild(footer);
  } else {
    content.className = "px-4 py-2.5 bg-blue-600 text-white text-sm rounded-2xl rounded-tr-none shadow-sm inline-block max-w-full break-words";
    content.textContent = text;
  }

  container.appendChild(content);
  return container;
}
