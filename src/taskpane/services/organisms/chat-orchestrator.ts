import { marked } from "marked";
import { CopilotResponse, ChatContext, AuthController } from "../atoms/types";
import { sendToCopilot } from "./api-orchestrator";
import { getWordContext, applyOfficeActions } from "../molecules/word-actions";
import { appendMessage, removeTypingIndicator } from "../molecules/ui-renderer";
import { PROFESSIONAL_DRAFT_DIRECTIVE } from "../atoms/prompt-template";
import { ChatUiHelper } from "../molecules/chat-ui-helper";
import { WordIntegrator } from "../molecules/word-integrator";

/**
 * Organism: Chat Orchestrator
 * Coordinates the full chat interaction flow between UI, Office context, and AI service.
 */
export class ChatOrchestrator {
  public static config: Partial<Record<string, string>> = {};
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

    // 1. Prepare UI (Molecule Delegation)
    ChatUiHelper.prepare(ctx, prompt);

    const enhancedPrompt = PROFESSIONAL_DRAFT_DIRECTIVE(prompt);

    let finalContent = "";
    let copilotResponse: CopilotResponse | null = null;
    let receivedFirstChunk = false;

    // 2. Define the callback for applying changes to Word (Molecule Delegation)
    const onApply = async () => {
      if (!finalContent) return;
      await WordIntegrator.applyContent(finalContent);

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
        const guideText = (ChatOrchestrator.config.PREVIEW_MODE_GUIDE_MD as string) || "Preview mode active.";

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

          if (chunk.startsWith("[ASK_USER]:")) {
            const parts = chunk.split(":");
            const sessionId = parts[1];
            const issue = parts.slice(2).join(":"); // Rejoin everything else as the question
            ChatUiHelper.renderAskUser(assistantBubble, sessionId, issue);
            return;
          }

          streamBuffer += chunk;
          ChatUiHelper.updateAssistantBubble(
            assistantBubble,
            streamBuffer,
            (txt: string) => marked.parse(txt) as string
          );
        }
      );

      // 7. Post-process response
      finalContent = (copilotResponse?.text?.trim() || streamBuffer.trim());
      ChatUiHelper.completeAssistantBubble(assistantBubble, finalContent);

      // Functional Optimization: Render Action Buttons (Replace/Insert)
      if (copilotResponse && copilotResponse.actions && copilotResponse.actions.length > 0) {
        ChatUiHelper.renderActions(assistantBubble, copilotResponse.actions, async (type: string, val: string) => {
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
