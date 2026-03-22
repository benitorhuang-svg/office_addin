/* global document, navigator, setTimeout, HTMLElement, HTMLButtonElement */

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
          const originalText = copyBtn.innerHTML;
          copyBtn.textContent = "✅ Copied!";
          setTimeout(() => {
            copyBtn.innerHTML = originalText;
          }, 2000);
        });
      };
    }

    const applyBtn = wrapper.querySelector(".apply-to-word") as HTMLButtonElement;
    if (applyBtn && onApply) {
      applyBtn.onclick = () => {
        applyBtn.disabled = true;
        const originalText = applyBtn.innerHTML;
        applyBtn.textContent = "⌛ Applying...";
        onApply();
        setTimeout(() => {
          applyBtn.disabled = false;
          applyBtn.innerHTML = originalText;
        }, 3000);
      };
    }
  } else {
    const textEl = document.createElement("div");
    textEl.className = "text";
    textEl.textContent = text;

    wrapper.appendChild(textEl);
  }

  return wrapper;
}
