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
  group.className = "shrink-0 p-4 pb-6 bg-white/40 backdrop-blur-xl border-t border-white/20";

  // Actions Row (Top of prompt area)
  const actionsRow = document.createElement("div");
  actionsRow.className = "flex items-center justify-between mb-3 px-1";

  // Left group: Mode toggle + Model selector
  const leftGroup = document.createElement("div");
  leftGroup.className = "flex items-center gap-2";

  const modeBtn = createButton({
    label: modelMode === "auto" ? "Default" : "Custom",
    className: `px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest ${
      modelMode === "auto" 
        ? "bg-slate-100 text-slate-500 hover:bg-slate-200" 
        : "bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/10"
    }`,
    onClick: () => onModeChange(modelMode === "auto" ? "manual" : "auto"),
  });

  const modelSelector = createModelSelector({
    id: "model-select",
    models: availableModels,
    selectedModel,
    onChange: onModelChange,
  });

  leftGroup.appendChild(modeBtn);
  leftGroup.appendChild(modelSelector);
  actionsRow.appendChild(leftGroup);

  // Logout
  const logoutBtn = document.createElement("button");
  logoutBtn.className = "p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all active:scale-95";
  logoutBtn.title = "Settings / Connection";
  logoutBtn.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path>
      <line x1="12" y1="2" x2="12" y2="12"></line>
    </svg>
  `;
  logoutBtn.onclick = onLogout;
  actionsRow.appendChild(logoutBtn);
  group.appendChild(actionsRow);

  // Input Wrapper
  const wrapper = document.createElement("div");
  wrapper.className = "relative flex items-end gap-2 bg-white/70 border border-slate-200 p-2 pl-4 rounded-2xl shadow-sm focus-within:ring-2 focus-within:ring-blue-500/10 focus-within:border-blue-500 transition-all duration-300";

  const textarea = document.createElement("textarea");
  textarea.id = "chat-input";
  textarea.className = "flex-1 bg-transparent border-none focus:outline-none focus:ring-0 text-sm text-slate-800 py-2.5 max-h-48 resize-none scroll-smooth placeholder:text-slate-400";
  textarea.rows = 1;
  textarea.placeholder = "Type your instruction...";
  textarea.setAttribute("aria-label", "Chat input");

  textarea.oninput = () => {
    textarea.style.height = "auto";
    textarea.style.height = (textarea.scrollHeight > 192 ? 192 : textarea.scrollHeight) + "px";
  };

  textarea.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  });

  const sendBtn = document.createElement("button");
  sendBtn.id = "send-btn";
  sendBtn.className = "p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 hover:shadow-lg transition-all active:scale-90 transform shrink-0";
  sendBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>`;
  sendBtn.onclick = () => onSend();

  wrapper.appendChild(textarea);
  wrapper.appendChild(sendBtn);
  group.appendChild(wrapper);

  return group;
}
