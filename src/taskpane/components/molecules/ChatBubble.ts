export interface ChatBubbleProps {
  role: "user" | "assistant";
  text: string;
  onApply?: () => void;
}

export function createChatBubble({ role, text, onApply }: ChatBubbleProps): HTMLElement {
  const wrapper = document.createElement("div");
  wrapper.className = `mol-chat-bubble ${role === "user" ? "user" : "assistant-card"}`;

  if (role === "assistant") {
    wrapper.innerHTML = `
      <div class="task-status-row">
        <div class="task-icon-area">
          <svg class="task-spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/></svg>
          <svg class="task-check" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </div>
        <div class="task-label">TASK: GENERATING...</div>
      </div>
      <div class="text-preview skeleton">Writing content...</div>
      <div class="bubble-action-group">
        <button class="action-btn-mini apply-to-word" title="實作至 Word">✨ 實作至 Word</button>
        <button class="action-btn-mini copy-all" title="複製全部內容">📋 Copy</button>
      </div>
    `;

    // Store the text reference for copy/apply
    wrapper.dataset.fullText = text;

    const copyBtn = wrapper.querySelector(".copy-all") as HTMLButtonElement;
    if (copyBtn) {
      copyBtn.onclick = () => {
        const contentText = wrapper.dataset.fullText || text;
        navigator.clipboard.writeText(contentText).then(() => {
          copyBtn.textContent = "✅ Copied!";
          setTimeout(() => { copyBtn.textContent = "📋 Copy"; }, 2000);
        });
      };
    }

    const applyBtn = wrapper.querySelector(".apply-to-word") as HTMLButtonElement;
    if (applyBtn && onApply) {
      applyBtn.onclick = () => {
        applyBtn.disabled = true;
        applyBtn.textContent = "⌛ Applying...";
        onApply();
        setTimeout(() => {
           applyBtn.disabled = false;
           applyBtn.textContent = "✨ 實作至 Word";
        }, 3000);
      };
    }
  } else {
    const roleEl = document.createElement("div");
    roleEl.className = "role";
    roleEl.textContent = "TASK PROMPT";

    const textEl = document.createElement("div");
    textEl.className = "text";
    textEl.textContent = text;

    wrapper.appendChild(roleEl);
    wrapper.appendChild(textEl);
  }
  
  return wrapper;
}
