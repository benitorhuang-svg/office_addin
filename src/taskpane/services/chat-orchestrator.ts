/* global HTMLElement */

import { marked } from "marked";
import { CopilotResponse, ChatContext, AuthController } from "../types";
import { sendToCopilot } from "./api";
import { getWordContext, insertTextIntoWord, applyOfficeActions } from "./word-actions";
import { appendMessage, removeTypingIndicator } from "./ui";
import { PROFESSIONAL_DRAFT_DIRECTIVE } from "./atoms/prompt-template";
import { ChatUiHelper } from "./molecules/chat-ui-helper";

/**
 * Organism: Chat Orchestrator
 * Coordinates the full chat interaction flow between UI, Office context, and AI service.
 */
export class ChatOrchestrator {
  private isGenerating = false;

  constructor() { }

  /**
   * Main entry point for sending a user prompt to the AI.
   * Handles UI updates, context gathering, and response processing.
   */
  public async handleSend(
    prompt: string,
    model: string,
    presetId: string,
    authController: AuthController,
    ctx: ChatContext
  ): Promise<string> {
    if (this.isGenerating) return "";
    this.isGenerating = true;

    // 1. Prepare UI
    ChatUiHelper.prepare(ctx, prompt);

    const enhancedPrompt = PROFESSIONAL_DRAFT_DIRECTIVE(prompt);

    let finalContent = "";
    let copilotResponse: CopilotResponse | null = null;
    let receivedFirstChunk = false;

    // 2. Define the callback for applying changes to Word
    const onApply = async () => {
      if (!finalContent) return;

      // Check if it's the preview guide (has HTML tags like <br>) or has markdown markers
      if (finalContent.includes("<br>") || finalContent.includes("<li>") || finalContent.includes("**")) {
        // Use Word's insertHtml for better layout (Supports Bold, Lists, Breaks)
        await Word.run(async (context) => {
          const range = context.document.getSelection();
          // Convert Markdown to true HTML (strong tags instead of **)
          const renderedHtml = marked.parse(finalContent);
          // Set a premium default font (Microsoft JhengHei for TC)
          const htmlWrapper = `
            <html>
              <head>
                <style>
                  body { font-family: '微軟正黑體', 'Microsoft JhengHei', 'Segoe UI', sans-serif; font-size: 11pt; }
                </style>
              </head>
              <body>${renderedHtml}</body>
            </html>`;
          range.insertHtml(htmlWrapper, Word.InsertLocation.replace);
          await context.sync();
        });
      } else {
        // Fallback for real AI responses: Strip any remaining raw tags and insert
        const cleanContent = finalContent.replace(/<[^>]*>?/gm, '');
        await insertTextIntoWord(cleanContent, true);
      }

      if (copilotResponse?.officeActions) {
        await applyOfficeActions(copilotResponse.officeActions, "");
      }
    };

    // 3. Create the initial non-complete bubble
    const assistantBubble = appendMessage(ctx.historyEl, "assistant", "", onApply) as HTMLElement;

    try {
      // 4. Check for Preview Mode (Canned response)
      if (authController.getAuthProvider() === "preview") {
        removeTypingIndicator();
        const guideText = `您目前處於 **預覽模式**。<br>**本工具支援以下登入方式：**<br>1. **Google Gemini**：使用 CLI 或 API Key 。<br>2. **GitHub Copilot**：使用 CLI 、 透過OAuth 或 PAT 連線。<br>3. **Azure OpenAI**：使用自有憑證。<br>**如何開始使用？**<br>點擊右下角 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 4px;"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg> **登出按鈕** 即可設定連線。`;

        ChatUiHelper.updateAssistantBubble(assistantBubble, guideText, (txt) => marked.parse(txt) as string);
        ChatUiHelper.completeAssistantBubble(assistantBubble, guideText);

        const previewEl = assistantBubble?.querySelector(".text-preview") as HTMLElement;
        if (previewEl) previewEl.innerHTML = marked.parse(guideText) as string;

        finalContent = guideText; // Fix: Set content before returning so onApply works
        return guideText;
      }

      // 5. Gather Context
      const accessToken = authController.getAccessToken();
      const geminiToken = authController.getGeminiToken();
      const officeContext = await getWordContext();

      // 6. Interact with API (The Organism)
      let streamBuffer = "";
      copilotResponse = await sendToCopilot(
        enhancedPrompt,
        accessToken,
        officeContext,
        model,
        presetId,
        geminiToken,
        (chunk) => {
          if (!receivedFirstChunk) {
            receivedFirstChunk = true;
            removeTypingIndicator();
          }
          streamBuffer += chunk;
          ChatUiHelper.updateAssistantBubble(
            assistantBubble,
            streamBuffer,
            (txt) => marked.parse(txt) as string
          );
        }
      );

      // 7. Post-process response
      finalContent = (copilotResponse?.text?.trim() || streamBuffer.trim());
      ChatUiHelper.completeAssistantBubble(assistantBubble, finalContent);

      // Functional Optimization: Render Action Buttons (Replace/Insert)
      if (copilotResponse && copilotResponse.actions && copilotResponse.actions.length > 0) {
        ChatUiHelper.renderActions(assistantBubble, copilotResponse.actions, async (type, val) => {
          await applyOfficeActions([{ type: type as "replace" | "insert", value: val }], "");
        });
      }

      // Update the UI with the final parsed Markdown
      const previewEl = assistantBubble?.querySelector(".text-preview") as HTMLElement;
      if (previewEl) {
        previewEl.innerHTML = marked.parse(finalContent) as string;
      }

      return finalContent;
    } catch (error) {
      const errText = `Error: ${error instanceof Error ? error.message : String(error)}`;
      ChatUiHelper.renderError(assistantBubble, errText);
      return "";
    } finally {
      this.isGenerating = false;
      ChatUiHelper.finalize(ctx);
    }
  }
}
