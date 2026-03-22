 
import { createModelSelector } from "./ModelSelector";

export interface PromptGroupProps {
  onSend: () => void;
  onClearChat?: () => void;
  availableModels: string[];
  selectedModel?: string;
  onModelChange: (model: string) => void;
  modelMode?: 'auto' | 'manual';
  onModeChange: (mode: 'auto' | 'manual') => void;
  onLogout: () => void;
}

export function createPromptGroup({
  onSend,
  onClearChat,
  availableModels,
  selectedModel,
  onModelChange,
  modelMode = 'auto',
  onModeChange,
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

  // Left: Mode & Model Selector
  const leftGroup = document.createElement("div");
  leftGroup.style.display = "flex";
  leftGroup.style.gap = "4px";
  leftGroup.style.alignItems = "center";

  const modeBtn = document.createElement("button");
  modeBtn.className = "action-btn-mini";
  modeBtn.style.padding = "2px 6px";
  modeBtn.style.fontSize = "10px";
  modeBtn.style.fontWeight = "bold";
  modeBtn.style.borderRadius = "4px";
  modeBtn.textContent = modelMode === 'auto' ? "預設" : "手動";
  modeBtn.style.background = modelMode === 'auto' ? "var(--primary-light, #E8F0FE)" : "#F5F5F5";
  modeBtn.style.color = modelMode === 'auto' ? "var(--primary, #1A73E8)" : "#666";
  modeBtn.style.border = "1px solid rgba(0,0,0,0.05)";
  modeBtn.style.cursor = "pointer";
  modeBtn.onclick = () => onModeChange(modelMode === 'auto' ? 'manual' : 'auto');
  
  const modelSelector = createModelSelector({
    id: "model-select",
    models: availableModels,
    selectedModel,
    onChange: onModelChange,
  });

  leftGroup.appendChild(modeBtn);
  leftGroup.appendChild(modelSelector);
  actionsRow.appendChild(leftGroup);

  // Center: Clear Link
  if (onClearChat) {
    const clearLink = document.createElement("button");
    clearLink.className = "action-btn-mini";
    clearLink.style.background = "transparent";
    clearLink.style.border = "none";
    clearLink.style.color = "var(--text-muted, #888)";
    clearLink.style.cursor = "pointer";
    clearLink.style.padding = "4px 8px";
    clearLink.title = "清除對話歷史";
    clearLink.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2m-6 5v6m4-6v6"></path></svg>`;

    clearLink.addEventListener("mouseover", () => {
      clearLink.style.color = "var(--error, #D93025)";
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
