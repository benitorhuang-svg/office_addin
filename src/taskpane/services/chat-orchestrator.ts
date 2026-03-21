/* global HTMLElement, HTMLTextAreaElement, HTMLButtonElement */

import { sendToCopilot } from "./api";
import { getWordContext } from "./word-actions";
import { appendMessage, removeTypingIndicator, showTypingIndicator } from "./ui";
import { insertTextIntoWord } from "./word-actions";
import { applyOfficeActions } from "./word-actions";

export interface ChatContext {
  historyEl: HTMLElement | null;
  applyStatus: HTMLElement | null;
  promptEl: HTMLTextAreaElement | null;
  sendBtn: HTMLButtonElement | null;
  responseEl: HTMLElement | null;
  runtimeModel: HTMLElement | null;
}

export class ChatOrchestrator {
  private isGenerating = false;

  constructor() {}

  public async handleSend(
    prompt: string,
    model: string,
    presetId: string,
    authController: any,
    ctx: ChatContext
  ): Promise<string> {
    if (this.isGenerating) return "";

    this.isGenerating = true;

    // UI Setup
    if (ctx.historyEl) {
      const existingActive = ctx.historyEl.querySelectorAll(
        '.mol-chat-bubble.assistant-card:not([data-complete="true"])'
      );
      existingActive.forEach((el) => el.remove());
      ctx.historyEl.querySelector(".welcome-message-container")?.remove();
    }

    appendMessage(ctx.historyEl, "user", prompt);
    showTypingIndicator(ctx.historyEl);

    // High-Authority Drafting Directive: Eliminate brief outputs
    const enhancedPrompt = `
      ### 專業文件撰寫指令 ###
      使用者需求：${prompt}
      
      請作為一名資深的專業文案專家與商務顧問，針對上述需求進行「深度擴寫與專業優化」。
      
      執行要求如下：
      1. **專業度與深度**：產出的內容必須具備正式文件的嚴謹感，嚴禁僅重複使用者輸入或產出空泛大綱。請主動補充背景知識、專業洞見與細節細節展開。
      2. **結構化佈局**：
         - 必須包含具備吸引力且專業的標題。
         - 使用清晰的段落區分（引言、核心論述、具體細節、結語/行動建議）。
         - 邏輯層次分明，確保內容讀起來具備高度說服力。
      3. **語調與風格**：
         - 使用繁體中文進行撰寫。
         - 風格應根據預設模式進行調整，但始終保持流暢、不累贅的散文式撰寫風格。
         - 對於關鍵名詞，應保持專業與統一。
      4. **輸出格式**：輸出的 Markdown 應層次清晰，能夠直接應用於 Word 文件中。
      
      開始撰寫（請直接產出內容）：
    `;

    if (ctx.promptEl) {
      ctx.promptEl.value = "";
      ctx.promptEl.style.height = "auto";
      ctx.promptEl.disabled = true;
    }
    if (ctx.sendBtn) {
      ctx.sendBtn.disabled = true;
      ctx.sendBtn.style.opacity = "0.5";
    }

    let finalContent = "";
    let response: any = null;

    const onApply = async () => {
      if (!finalContent) return;
      await insertTextIntoWord(finalContent, true);
      if (response && response.officeActions) {
        await applyOfficeActions(response.officeActions, "");
      }
    };

    const assistantBubble = appendMessage(ctx.historyEl, "assistant", "", onApply);
    const previewEl = assistantBubble?.querySelector(".text-preview") as HTMLElement;

    try {
      const token = authController.getAccessToken();
      const officeContext = await getWordContext();
      const geminiToken = authController.getGeminiToken();

      let streamBuffer = "";
      response = await sendToCopilot(
        enhancedPrompt,
        token,
        officeContext,
        model,
        presetId,
        geminiToken,
        (chunk) => {
          streamBuffer += chunk;
          if (previewEl) {
            previewEl.classList.remove("skeleton");
            const previewText =
              streamBuffer.length > 200 ? streamBuffer.substring(0, 200) + "..." : streamBuffer;
            previewEl.textContent = previewText;
          }
          if (assistantBubble) {
            (assistantBubble as HTMLElement).dataset.fullText = streamBuffer;
          }
        }
      );

      finalContent = (response?.text ?? streamBuffer).trim();
      removeTypingIndicator();

      // Update the bubble metadata for Copy/Apply logic
      if (assistantBubble) {
        (assistantBubble as HTMLElement).dataset.fullText = finalContent;
        assistantBubble.setAttribute("data-complete", "true");
      }

      if (previewEl) {
        previewEl.classList.remove("skeleton");
        // Show a longer preview in the bubble since we aren't auto-inserting
        const finalPreview =
          finalContent.length > 150 ? finalContent.substring(0, 150) + "..." : finalContent;
        previewEl.textContent = finalPreview;
      }

      return finalContent;
    } catch (error) {
      removeTypingIndicator();
      const errText = `Error: ${error instanceof Error ? error.message : String(error)}`;

      if (assistantBubble) {
        if (previewEl) {
          previewEl.classList.remove("skeleton");
          previewEl.textContent = errText;
          previewEl.style.color = "#DC3545";
        }
      }
      throw error;
    } finally {
      this.isGenerating = false;
      if (ctx.promptEl) ctx.promptEl.disabled = false;
      if (ctx.sendBtn) {
        ctx.sendBtn.disabled = false;
        ctx.sendBtn.style.opacity = "1";
      }
      ctx.promptEl?.focus();
    }
  }
}
