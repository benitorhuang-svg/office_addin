/* global document, navigator, setTimeout, HTMLElement */

import { createButton } from "../atoms/Button";

export interface ChatBubbleProps {
  role: "user" | "assistant";
  text: string;
  onApply?: () => void;
}

export function createChatBubble({ role, text, onApply }: ChatBubbleProps): HTMLElement {
  const container = document.createElement("div");
  container.className = `mol-chat-bubble ${role}`;

  // 1. Label/Icon Row (Premium identification)
  const header = document.createElement("div");
  header.className = "bubble-header";
  
  const icon = document.createElement("div");
  icon.className = "bubble-icon";
  icon.innerHTML = role === "user" 
    ? `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`
    : `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"></path><path d="M12 6v6l4 2"></path></svg>`;
  
  const roleLabel = document.createElement("span");
  roleLabel.className = "bubble-role-label";
  roleLabel.textContent = role === "user" ? "YOU" : "office_Agent";
  
  header.appendChild(icon);
  header.appendChild(roleLabel);
  container.appendChild(header);

  // 2. Content Area
  const content = document.createElement("div");
  content.className = "bubble-content";
  
  if (role === "assistant") {
    container.dataset.fullText = text;
    content.className += " assistant-card-premium";
    
    // Preview area (Markdown enabled)
    const preview = document.createElement("div");
    preview.className = "text-preview skeleton";
    preview.textContent = text || "Thinking...";
    content.appendChild(preview);

    // Hidden until complete via CSS or JS toggle
    const footer = document.createElement("div");
    footer.className = "bubble-footer-actions";
    
    const applyBtn = createButton({
      label: "實作至 Word",
      className: "action-pill-btn apply",
    });
    if (onApply) applyBtn.onclick = onApply;

    const copyBtn = createButton({
      label: "複製",
      className: "action-pill-btn",
    });
    copyBtn.onclick = () => {
      const raw = container.dataset.fullText || text;
      // Aggressive strip for true plain text: Remove HTML tags and Markdown markers
      const clean = raw.replace(/<[^>]*>?/gm, '').replace(/\**/g, '');
      navigator.clipboard.writeText(clean);
    };

    footer.appendChild(applyBtn);
    footer.appendChild(copyBtn);
    content.appendChild(footer);
  } else {
    content.textContent = text;
  }

  container.appendChild(content);
  return container;
}
