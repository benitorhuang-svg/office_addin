import { marked } from "marked";
import { HistoryManager } from "./HistoryManager";
import { ChatContext, OfficeAction } from "../atoms/types";
import { createChatActionGroup } from "../../components/molecules/ChatActionGroup";
import { createAskUserCard } from "../../components/molecules/AskUserCard";

/**
 * Molecule Coordinator: Chat UI Helper
 * Refactored to coordinate specialized molecules (ChatActionGroup, AskUserCard).
 */
export const ChatUiHelper = {
  prepare(ctx: ChatContext, prompt: string) {
    const safeHistory = document.getElementById("nexus-chat-history") || ctx.historyEl;
    
    if (safeHistory) {
      // Clear legacy containers to ensure DOM performance
      const activeAssistant = safeHistory.querySelectorAll('.nexus-bubble-assistant-container:not([data-complete="true"])');
      activeAssistant.forEach((el) => el.remove());
      safeHistory.querySelector(".welcome-message-container")?.remove();
      HistoryManager.removeTypingIndicator(); 
    }

    // Append User Prompt
    HistoryManager.appendMessage({ historyEl: safeHistory as HTMLElement, role: "user", text: prompt });
    HistoryManager.showTypingIndicator(safeHistory as HTMLElement);

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

  finalize(ctx: ChatContext) {
    HistoryManager.removeTypingIndicator();
    if (ctx.promptEl) {
      ctx.promptEl.disabled = false;
      ctx.promptEl.focus();
    }
    if (ctx.sendBtn) {
      ctx.sendBtn.disabled = false;
      ctx.sendBtn.style.opacity = "1";
    }
  },

  updateAssistantBubble(bubble: HTMLElement | null, content: string, parseMarkdown: (text: string) => string) {
    if (!bubble) return;
    const resultEl = bubble.querySelector(".nexus-result-text") as HTMLElement;
    
    if (resultEl) {
      resultEl.classList.remove("nexus-opacity-0");
      resultEl.innerHTML = parseMarkdown(content);
    }
    
    bubble.dataset.fullText = content;
    const dotsContent = bubble.querySelector(".typing-dots") as HTMLElement;
    if (dotsContent) dotsContent.style.opacity = content.trim() ? "1" : "0.3";
  },

  completeAssistantBubble(bubble: HTMLElement | null, content: string) {
    if (!bubble) return;
    const resultEl = bubble.querySelector(".nexus-result-text") as HTMLElement;
    
    if (resultEl) {
      resultEl.classList.remove("nexus-opacity-0");
      resultEl.innerHTML = marked.parse(content || "") as string;
    }
    
    bubble.dataset.fullText = content;
    bubble.setAttribute("data-complete", "true");
    const dots = bubble.querySelector(".typing-dots") as HTMLElement;
    if (dots) dots.remove(); // Clean up on complete
  },

  renderActions(bubble: HTMLElement | null, actions: OfficeAction[], onAction: (type: string, value: string) => void) {
    if (!bubble || !actions || actions.length === 0) return;
    const actionGroup = createChatActionGroup({ actions, onAction });
    const resultEl = bubble.querySelector(".nexus-result-text") as HTMLElement;
    if (resultEl) resultEl.after(actionGroup);
  },

  renderAskUser(bubble: HTMLElement | null, sessionId: string, question: string) {
    if (!bubble) return;
    const askCard = createAskUserCard({ sessionId, question });
    const resultEl = bubble.querySelector(".nexus-result-text") as HTMLElement;
    if (resultEl) resultEl.after(askCard);
  },

  renderError(bubble: HTMLElement | null, errorText: string) {
    if (!bubble) return;
    const resultEl = bubble.querySelector(".nexus-result-text") as HTMLElement;
    if (resultEl) {
      resultEl.classList.remove("nexus-opacity-0");
      resultEl.textContent = errorText;
      resultEl.classList.add("nexus-text-rose-500", "nexus-font-bold");
    }
  }
};
