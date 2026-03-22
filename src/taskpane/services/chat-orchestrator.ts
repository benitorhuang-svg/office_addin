/* global HTMLElement */

import { marked } from "marked";
import { CopilotResponse, ChatContext, AuthController } from "../types";
import { sendToCopilot } from "./api";
import { getWordContext, insertTextIntoWord, applyOfficeActions } from "./word-actions";
import { appendMessage } from "./ui";
import { PROFESSIONAL_DRAFT_DIRECTIVE } from "./atoms/prompt-template";
import { ChatUiHelper } from "./molecules/chat-ui-helper";

/**
 * Organism: Chat Orchestrator
 * Coordinates the full chat interaction flow between UI, Office context, and AI service.
 */
export class ChatOrchestrator {
  private isGenerating = false;

  constructor() {}

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

    // 2. Define the callback for applying changes to Word
    const onApply = async () => {
      if (!finalContent) return;
      await insertTextIntoWord(finalContent, true);
      if (copilotResponse?.officeActions) {
        await applyOfficeActions(copilotResponse.officeActions, "");
      }
    };

    // 3. Create the initial non-complete bubble
    const assistantBubble = appendMessage(ctx.historyEl, "assistant", "", onApply) as HTMLElement;

    try {
      // 4. Gather Context
      const accessToken = authController.getAccessToken();
      const geminiToken = authController.getGeminiToken();
      const officeContext = await getWordContext();

      // 5. Interact with API (The Organism)
      let streamBuffer = "";
      copilotResponse = await sendToCopilot(
        enhancedPrompt,
        accessToken,
        officeContext,
        model,
        presetId,
        geminiToken,
        (chunk) => {
          streamBuffer += chunk;
          ChatUiHelper.updateAssistantBubble(
            assistantBubble, 
            streamBuffer, 
            (txt) => marked.parse(txt) as string
          );
        }
      );

      // 6. Post-process response
      finalContent = (copilotResponse?.text ?? streamBuffer).trim();
      ChatUiHelper.completeAssistantBubble(assistantBubble, finalContent);
      
      // Functional Optimization: Render Action Buttons (Replace/Insert)
      if (copilotResponse && copilotResponse.actions && copilotResponse.actions.length > 0) {
        ChatUiHelper.renderActions(assistantBubble, copilotResponse.actions, async (type, val) => {
          await applyOfficeActions([{ type: type as 'replace' | 'insert', value: val }], "");
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
      throw error;
    } finally {
      this.isGenerating = false;
      ChatUiHelper.finalize(ctx);
    }
  }
}
