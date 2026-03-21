import { WritingPreset } from "../../types";

export interface PromptGroupProps {
  onSend: () => void;
  presets: WritingPreset[];
  selectedPreset: string;
  onPresetChange: (presetId: string) => void;
}

export function createPromptGroup({ 
  onSend, 
  presets, 
  selectedPreset, 
  onPresetChange 
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
    textarea.style.height = (textarea.scrollHeight) + "px";
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

  return group;
}
