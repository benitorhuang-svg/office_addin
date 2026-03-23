/* global HTMLElement */
import { marked } from "marked";
import { appendMessage, showTypingIndicator, removeTypingIndicator } from "../ui";
import { ChatContext } from "../../types";

/**
 * Molecule: Chat UI Helper
 * Orchestrates multiple UI atoms (History, Input, Buttons) to manage the chat lifecycle.
 */
export const ChatUiHelper = {
  /**
   * Cleans UI for a new message cycle.
   */
  prepare(ctx: ChatContext, prompt: string) {
    if (ctx.historyEl) {
      // Remove any existing non-complete assistant bubbles or welcome message
      const existingActive = ctx.historyEl.querySelectorAll(
        '.mol-chat-bubble.assistant-card:not([data-complete="true"])'
      );
      existingActive.forEach((el) => el.remove());
      ctx.historyEl.querySelector(".welcome-message-container")?.remove();
    }

    appendMessage(ctx.historyEl, "user", prompt);
    showTypingIndicator(ctx.historyEl);

    if (ctx.promptEl) {
      ctx.promptEl.value = "";
      ctx.promptEl.style.height = "auto";
      ctx.promptEl.disabled = true;
    }
    if (ctx.sendBtn) {
      ctx.sendBtn.disabled = true;
      ctx.sendBtn.style.opacity = "0.5";
    }
  },

  /**
   * Finalizes UI after a message cycle.
   */
  finalize(ctx: ChatContext) {
    removeTypingIndicator();
    if (ctx.promptEl) {
      ctx.promptEl.disabled = false;
      ctx.promptEl.focus();
    }
    if (ctx.sendBtn) {
      ctx.sendBtn.disabled = false;
      ctx.sendBtn.style.opacity = "1";
    }
  },

  /**
   * Updates an assistant bubble with new content during streaming.
   */
  updateAssistantBubble(
    bubble: HTMLElement | null,
    content: string,
    parseMarkdown: (text: string) => string
  ) {
    const previewEl = bubble?.querySelector(".text-preview") as HTMLElement;
    if (previewEl) {
      previewEl.classList.remove("skeleton");
      previewEl.innerHTML = parseMarkdown(content);
    }
    if (bubble) {
      bubble.dataset.fullText = content;
    }
  },

  /**
   * Marks an assistant bubble as complete.
   */
  completeAssistantBubble(bubble: HTMLElement | null, content: string) {
    if (bubble) {
      const previewEl = bubble.querySelector(".text-preview") as HTMLElement;
      if (previewEl) {
        previewEl.classList.remove("skeleton");
        previewEl.innerHTML = marked.parse(content || "") as string;
      }
      bubble.dataset.fullText = content;
      bubble.setAttribute("data-complete", "true");
    }
  },

  /**
   * Renders action buttons (e.g., Replace Selection, Insert) in the bubble.
   */
  renderActions(
    bubble: HTMLElement | null,
    actions: { type: string; value: string }[],
    onAction: (type: string, value: string) => void
  ) {
    if (!bubble || !actions || actions.length === 0) return;

    const actionContainer = document.createElement("div");
    actionContainer.className = "bubble-actions-container";
    actionContainer.style.marginTop = "12px";
    actionContainer.style.display = "flex";
    actionContainer.style.gap = "8px";
    actionContainer.style.flexWrap = "wrap";

    actions.forEach((action) => {
      const btn = document.createElement("button");
      btn.className = "action-pill-btn";

      const label = action.type === "replace" ? "💡 替換選取文字" : "➕ 插入至文件";
      btn.innerHTML = `<span>${label}</span>`;

      btn.onclick = () => {
        btn.disabled = true;
        btn.style.opacity = "0.5";
        onAction(action.type, action.value);
        setTimeout(() => {
          btn.disabled = false;
          btn.style.opacity = "1";
        }, 1000);
      };

      actionContainer.appendChild(btn);
    });

    const previewEl = bubble.querySelector(".text-preview");
    if (previewEl) {
      previewEl.after(actionContainer);
    }
  },

  /**
   * Renders an interactive question box for the ask_user tool.
   */
  renderAskUser(
    bubble: HTMLElement | null,
    sessionId: string,
    question: string
  ) {
    if (!bubble) return;

    const askContainer = document.createElement("div");
    askContainer.id = `ask-user-${sessionId}`;
    askContainer.className = "ask-user-container";
    askContainer.style.marginTop = "10px";
    askContainer.style.padding = "10px";
    askContainer.style.border = "1px solid #0078D4";
    askContainer.style.borderRadius = "8px";
    askContainer.style.backgroundColor = "rgba(0, 120, 212, 0.05)";

    const qEl = document.createElement("div");
    qEl.textContent = `🤔 ${question}`;
    qEl.style.fontWeight = "bold";
    qEl.style.marginBottom = "8px";
    askContainer.appendChild(qEl);

    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "請輸入您的回覆...";
    input.style.width = "100%";
    input.style.padding = "8px";
    input.style.marginBottom = "8px";
    input.style.borderRadius = "4px";
    input.style.border = "1px solid #ccc";
    askContainer.appendChild(input);

    const btn = document.createElement("button");
    btn.textContent = "傳送回覆";
    btn.className = "action-pill-btn";
    btn.style.backgroundColor = "#0078D4";
    btn.style.color = "white";
    
    btn.onclick = async () => {
      const answer = input.value.trim();
      if (!answer) return;

      btn.disabled = true;
      input.disabled = true;
      btn.textContent = "處理中...";

      try {
        const port = await (await import("../atoms/api-client")).findActiveServer();
        const res = await fetch(`https://localhost:${port}/api/copilot/response`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId, answer }),
        });
        
        if (res.ok) {
          askContainer.innerHTML = `<div style="color: #28A745; font-size: 0.9em;">✅ 已送出：${answer}</div>`;
          setTimeout(() => askContainer.remove(), 2000);
        } else {
          throw new Error("Failed to send response");
        }
      } catch (err) {
        btn.disabled = false;
        input.disabled = false;
        btn.textContent = "重試";
        alert("無法傳送回覆，請稍後再試。");
      }
    };

    askContainer.appendChild(btn);

    const previewEl = bubble.querySelector(".text-preview");
    if (previewEl) {
      previewEl.after(askContainer);
    }
  },

  /**
   * Renders an error message in the bubble.
   */
  renderError(bubble: HTMLElement | null, errorText: string) {
    const previewEl = bubble?.querySelector(".text-preview") as HTMLElement;
    if (previewEl) {
      previewEl.classList.remove("skeleton");
      previewEl.textContent = errorText;
      previewEl.style.color = "#DC3545";
    }
  },
};
