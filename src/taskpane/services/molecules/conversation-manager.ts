import { appendMessage } from "./ui-renderer";
import { ChatContext } from "../atoms/types";

interface Message {
  role: "user" | "assistant";
  text: string;
  timestamp: number;
}

/**
 * Molecule: Conversation Manager
 * Handles saving and restoring chat history to ensure persistence across sessions.
 */
export const ConversationManager = {
  STORAGE_KEY: "copilot_chat_history",
  MAX_HISTORY: 10,

  /**
   * Saves a message to history.
   */
  saveMessage(role: "user" | "assistant", text: string) {
    try {
      const history = this.getHistory();
      history.push({ role, text, timestamp: Date.now() });
      
      // Keep only the last N messages
      const trimmed = history.slice(-this.MAX_HISTORY);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(trimmed));
    } catch (e) {
      console.warn("[ConversationManager] Failed to save history:", e);
    }
  },

  /**
   * Retrieves history from storage.
   */
  getHistory(): Message[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  /**
   * Restores history to the UI.
   */
  restore(ctx: ChatContext, onApply?: () => void) {
    if (!ctx.historyEl) return;
    
    const history = this.getHistory();
    if (history.length === 0) return;

    // Clear existing (like welcome message)
    ctx.historyEl.innerHTML = "";

    history.forEach((msg) => {
      appendMessage(ctx.historyEl, msg.role, msg.text, onApply);
    });

    // Scroll to bottom
    ctx.historyEl.scrollTop = ctx.historyEl.scrollHeight;
  },

  /**
   * Clears the history.
   */
  clear() {
    localStorage.removeItem(this.STORAGE_KEY);
  }
};
