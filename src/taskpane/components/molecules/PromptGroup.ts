/* eslint-disable no-undef */
import { createModelSelector } from "./ModelSelector";

export interface PromptGroupProps {
  onSend: () => void;
  onClearChat?: () => void;
  availableModels: string[];
  selectedModel?: string;
  onModelChange: (model: string) => void;
  onLogout: () => void;
}

export function createPromptGroup({
  onSend,
  onClearChat,
  availableModels,
  selectedModel,
  onModelChange,
  onLogout,
}: PromptGroupProps): HTMLElement {
  const group = document.createElement("section");
  group.className = "mol-prompt-group";

  // Input/Send Area
  const wrapper = document.createElement("div");
  wrapper.className = "prompt-wrapper";

  const textarea = document.createElement("textarea");
  textarea.id = "chat-input";
  textarea.className = "atom-textarea";
  textarea.rows = 1;
  textarea.placeholder = "請輸入訊息...";

  // Auto-resize
  textarea.oninput = () => {
    textarea.style.height = "auto";
    textarea.style.height = textarea.scrollHeight + "px";
  };

  // Enter to send, Shift+Enter for newline
  textarea.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  });

  const btn = document.createElement("button");
  btn.id = "send-btn";
  btn.className = "send-icon-btn";
  btn.title = "送出訊息";
  btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>`;

  btn.onclick = () => onSend();

  wrapper.appendChild(textarea);
  wrapper.appendChild(btn);

  group.appendChild(wrapper);

  group.appendChild(wrapper);

  // Bottom Actions Row (Model Selector Left, Logout Right)
  const actionsRow = document.createElement("div");
  actionsRow.style.display = "flex";
  actionsRow.style.justifyContent = "space-between";
  actionsRow.style.alignItems = "center";
  actionsRow.style.marginTop = "8px";
  actionsRow.style.padding = "0 4px";

  // Left: Model Selector
  const modelSelector = createModelSelector({
    id: "model-select",
    models: availableModels,
    selectedModel,
    onChange: onModelChange,
  });
  actionsRow.appendChild(modelSelector);

  // Center: Clear Link
  if (onClearChat) {
    const clearLink = document.createElement("button");
    clearLink.className = "action-btn-mini";
    clearLink.style.background = "transparent";
    clearLink.style.border = "none";
    clearLink.style.color = "var(--text-muted, #888)";
    clearLink.style.textDecoration = "underline";
    clearLink.style.cursor = "pointer";
    clearLink.style.padding = "4px 8px";
    clearLink.style.fontSize = "11px";
    clearLink.innerHTML = "清除對話歷史";

    clearLink.addEventListener("mouseover", () => {
      clearLink.style.color = "var(--primary-color, #0078D4)";
    });
    clearLink.addEventListener("mouseout", () => {
      clearLink.style.color = "var(--text-muted, #888)";
    });

    clearLink.onclick = onClearChat;
    actionsRow.appendChild(clearLink);
  }

  // Right: Logout Button
  const logoutBtn = document.createElement("button");
  logoutBtn.id = "logout-btn";
  logoutBtn.className = "icon-btn-secondary mini"; // Using mini class if available
  logoutBtn.title = "Change Account / Log out";
  logoutBtn.style.padding = "4px";
  logoutBtn.style.width = "30px";
  logoutBtn.style.height = "30px";
  logoutBtn.style.borderRadius = "8px";
  logoutBtn.style.background = "rgba(0,0,0,0.03)";
  logoutBtn.style.border = "1px solid rgba(0,0,0,0.05)";
  logoutBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`;
  logoutBtn.onclick = onLogout;

  actionsRow.appendChild(logoutBtn);
  group.appendChild(actionsRow);

  return group;
}
