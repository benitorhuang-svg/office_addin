/* global HTMLElement */
import { marked } from "marked";
import { appendMessage, showTypingIndicator, removeTypingIndicator } from "./ui-renderer";
import { ChatContext } from "../atoms/types";

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
    const footerEl = bubble?.querySelector(".bubble-footer") as HTMLElement;
    if (previewEl) {
      previewEl.classList.remove("skeleton");
      previewEl.innerHTML = parseMarkdown(content);
    }
    if (footerEl) {
      footerEl.style.display = content.trim() ? "flex" : "none";
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
      const footerEl = bubble.querySelector(".bubble-footer") as HTMLElement;
      if (previewEl) {
        previewEl.classList.remove("skeleton");
        previewEl.innerHTML = marked.parse(content || "") as string;
      }
      if (footerEl) {
        footerEl.style.display = content.trim() ? "flex" : "none";
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
    actionContainer.className = "flex flex-wrap gap-2 mt-3";

    actions.forEach((action) => {
      const btn = document.createElement("button");
      btn.className = "action-pill-btn";

      const label = action.type === "replace" ? "💡 替換選取文字" : "➕ 插入至文件";
      btn.innerHTML = `<span>${label}</span>`;

      btn.onclick = () => {
        btn.disabled = true;
        onAction(action.type, action.value);
        setTimeout(() => {
          btn.disabled = false;
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
    askContainer.className = "ask-user-premium-card";

    const qEl = document.createElement("div");
    qEl.className = "ask-user-question";
    qEl.textContent = `🤔 ${question}`;
    askContainer.appendChild(qEl);

    const controls = document.createElement("div");
    controls.className = "ask-user-controls";

    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "請輸入您的回覆...";
    input.className = "w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 bg-white";
    controls.appendChild(input);

    const btn = document.createElement("button");
    btn.textContent = "傳送回覆";
    btn.className = "action-pill-btn bg-blue-600 text-white hover:bg-blue-700 border-blue-600";
    
    btn.onclick = async () => {
      const answer = input.value.trim();
      if (!answer) return;

      btn.disabled = true;
      input.disabled = true;
      btn.textContent = "處理中...";

      try {
        const { resolveLocalApiUrl } = await import("../molecules/local-server-resolver");
        const url = await resolveLocalApiUrl("/api/copilot/response");
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId, answer }),
        });
        
        if (res.ok) {
          askContainer.innerHTML = `<div class="text-green-600 text-sm font-medium">✅ 已送出：${answer}</div>`;
          setTimeout(() => askContainer.remove(), 2000);
        } else {
          throw new Error("Failed to send response");
        }
      } catch (_err) {
        btn.disabled = false;
        input.disabled = false;
        btn.textContent = "重試";
        alert("無法傳送回覆，請稍後再試。");
      }
    };

    controls.appendChild(btn);
    askContainer.appendChild(controls);

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
    const footerEl = bubble?.querySelector(".bubble-footer") as HTMLElement;
    if (previewEl) {
      previewEl.classList.remove("skeleton");
      previewEl.textContent = errorText;
      previewEl.classList.add("text-red-500");
    }
    if (footerEl) {
      footerEl.style.display = "none";
    }
  },
};
