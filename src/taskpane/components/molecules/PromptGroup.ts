import { createModelSelector } from "./ModelSelector";
import { createButton } from "../atoms/Button";

export interface PromptGroupProps {
  onSend: () => void;
  availableModels: string[];
  selectedModel?: string;
  onModelChange: (model: string) => void;
  modelMode?: "auto" | "manual";
  onModeChange: (mode: "auto" | "manual") => void;
  onLogout: () => void;
}

export function createPromptGroup({
  onSend,
  availableModels,
  selectedModel,
  onModelChange,
  modelMode = "auto",
  onModeChange,
  onLogout,
}: PromptGroupProps): HTMLElement {
  const group = document.createElement("section");
  group.className = "mol-prompt-group";

  // Atom: Textarea + Send button inside wrapper
  const wrapper = document.createElement("div");
  wrapper.className = "prompt-wrapper";

  const textarea = document.createElement("textarea");
  textarea.id = "chat-input";
  textarea.className = "atom-textarea";
  textarea.rows = 1;
  textarea.placeholder = "請輸入訊息...";
  textarea.setAttribute("aria-label", "Chat message input");

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

  // Atom: Send button
  const sendBtn = document.createElement("button");
  sendBtn.id = "send-btn";
  sendBtn.className = "send-icon-btn";
  sendBtn.title = "送出訊息";
  sendBtn.setAttribute("aria-label", "Send message");
  sendBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>`;
  sendBtn.onclick = () => onSend();

  wrapper.appendChild(textarea);
  wrapper.appendChild(sendBtn);
  group.appendChild(wrapper);

  // Molecule: Bottom Actions Row
  const actionsRow = document.createElement("div");
  actionsRow.className = "prompt-actions-row";

  // Left group: Mode toggle + Model selector
  const leftGroup = document.createElement("div");
  leftGroup.className = "prompt-left-group";

  // Atom: Mode toggle button
  const modeBtn = createButton({
    label: modelMode === "auto" ? "預設" : "手動",
    className: `prompt-mode-btn${modelMode === "auto" ? " active" : ""}`,
    onClick: () => onModeChange(modelMode === "auto" ? "manual" : "auto"),
  });

  // Atom: Model selector
  const modelSelector = createModelSelector({
    id: "model-select",
    models: availableModels,
    selectedModel,
    onChange: onModelChange,
  });

  leftGroup.appendChild(modeBtn);
  leftGroup.appendChild(modelSelector);
  actionsRow.appendChild(leftGroup);

  // Atom: Logout button
  const logoutBtn = createButton({
    id: "logout-btn",
    label: "",
    className: "prompt-logout-btn",
    onClick: onLogout,
  });
  logoutBtn.title = "Change Account / Log out";
  logoutBtn.setAttribute("aria-label", "Logout");
  logoutBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`;

  actionsRow.appendChild(logoutBtn);
  group.appendChild(actionsRow);

  return group;
}
