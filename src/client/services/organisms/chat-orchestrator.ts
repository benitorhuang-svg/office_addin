import { ChatContext, AuthController, NexusProvider, OfficeAction } from "../atoms/types";
import { HistoryManager } from "../molecules/HistoryManager";
import { ChatUiHelper } from "../molecules/chat-ui-helper";
import { CircuitBreaker } from "../molecules/circuit-breaker";
import { StreamEngine } from "../molecules/StreamEngine";
import { Toast } from "../../components/molecules/Toast";
import { IntelligenceStep } from "../../components/atoms/StepItem";

/**
 * Organism Service: Chat Orchestrator
 * High-level business logic for coordinating message delivery and document integration.
 */
export class ChatOrchestrator {
  private isGenerating = false;

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    if (typeof error === "object" && error !== null && "detail" in error) {
      const detail = (error as { detail?: unknown }).detail;
      if (typeof detail === "string" && detail.length > 0) {
        return detail;
      }
    }

    return String(error);
  }

  public async handleSend(
    prompt: string,
    model: string,
    presetId: string,
    auth: AuthController,
    ctx: ChatContext,
    systemPrompt?: string
  ): Promise<string> {
    if (this.isGenerating) return "";
    this.isGenerating = true;

    // 1. Prepare UI Container
    ChatUiHelper.prepare(ctx, prompt);
    const activeHistory = document.getElementById("nexus-chat-history") || ctx.historyEl;

    try {
      const provider = auth.getAuthProvider();
      if (provider === "preview") {
        const bubble = HistoryManager.appendMessage({
          historyEl: activeHistory as HTMLElement,
          role: "assistant",
          text: "",
        }) as HTMLElement;
        return await this.handlePreview(bubble);
      }

      // 2. Document Context Harvesting (CRITICAL: Must happen before step definition)
      const { getOfficeContext, applyUniversalOfficeActions } =
        await import("../molecules/office-actions");
      const docCtx = await getOfficeContext();
      const hostName = docCtx.host || "Word";

      // 3. Define Intelligence Steps
      const intelligenceSteps: IntelligenceStep[] = [
        { title: `分析 ${hostName} 工作環境`, status: "done" },
        { title: "封裝上下文內容對象", status: "active" },
        { title: "生成邏輯推理鏈結 (Chain of Thought)", status: "pending" },
        { title: "部署 AI 策略請求", status: "pending" },
        { title: `生成 ${hostName} 工業排版`, status: "pending" },
      ];

      const bubble = HistoryManager.appendMessage({
        historyEl: activeHistory as HTMLElement,
        role: "assistant",
        text: "",
        steps: intelligenceSteps,
      }) as HTMLElement;

      if (!bubble) throw new Error("Could not create chat bubble.");

      // Industrial Design Protocol: Injecting designer persona for PPT
      // Industrial Mission Strategy: [GOAL + TOOL] Directive
      let industrialSystemPrompt = systemPrompt || "";
      if (docCtx.host === "PowerPoint") {
        industrialSystemPrompt =
          (systemPrompt || "") +
          `\n
[MISSION_IDENTITY]: SENIOR_PPT_ARCHITECT_V10 (GOAL_MODE: ON)
Your primary MISSION is to architect and manufacture high-fidelity slide decks.
- [TOOL]: python_executor (For data/logic)
- [TOOL]: google_search (For trends)
`;
      } else if (docCtx.host === "Excel") {
        industrialSystemPrompt =
          (systemPrompt || "") +
          `\n
[MISSION_IDENTITY]: SENIOR_EXCEL_INSIGHT_ARCHITECT_V3 (HYPER_AUTOMATION: ON)
Your GOAL is to transform Excel into a premium analytical control center with zero-latency visualization.

[BRIDGE_PROTOCOL]:
To trigger the Excel Chart Factory IMMEDIATELY from within your Python logic, you MUST print the following protocol string:
[BRIDGE_DISPATCH]: EXCEL_CHART | <Title> | <Type> | <Range>
(Example: print("[BRIDGE_DISPATCH]: EXCEL_CHART | Trend Analysis | Line | A1:B10"))

[PROCEDURE]:
1. Use [python_executor] for all logic.
2. Inside your Python script, identify the data range and output the [BRIDGE_DISPATCH] string.
3. Use [THOUGHT] to explain your logic.

[CAPABILITIES]:
- [TOOL]: create_excel_chart (Standard)
- [TOOL]: python_executor (Enhanced with [BRIDGE_DISPATCH] capabilities)
`;
      }
      // 3. Contextualizing Steps
      if (intelligenceSteps[1]) intelligenceSteps[1].status = "done";
      if (intelligenceSteps[2]) intelligenceSteps[2].status = "active";
      HistoryManager.updateAssistantSteps(bubble, intelligenceSteps);

      // Wrap onChunk to handle COT/TASK markers
      const customOnChunk = (chunk: string) => {
        if (chunk.includes("[THOUGHT]:")) {
          if (intelligenceSteps[2]) intelligenceSteps[2].title = "Analyzing Core Concepts...";
          HistoryManager.updateAssistantSteps(bubble, intelligenceSteps);
        }
        if (chunk.includes("[DISPATCH]: EXCEL_CHART_INIT")) {
          if (intelligenceSteps[2]) intelligenceSteps[2].status = "done";
          if (intelligenceSteps[3]) intelligenceSteps[3].status = "done";
          if (intelligenceSteps[4]) {
            intelligenceSteps[4].status = "active";
            intelligenceSteps[4].title = "Rendering Analytical Insights...";
          }
          HistoryManager.updateAssistantSteps(bubble, intelligenceSteps);
        }
        if (chunk.includes("[TASK]:") || chunk.includes("---Slide")) {
          if (intelligenceSteps[2]) intelligenceSteps[2].status = "done";
          if (intelligenceSteps[3]) intelligenceSteps[3].status = "done";
          if (intelligenceSteps[4]) {
            intelligenceSteps[4].status = "active";
            intelligenceSteps[4].title = "Manufacturing Power Orbits...";
          }
          HistoryManager.updateAssistantSteps(bubble, intelligenceSteps);
        }
      };

      const res = await StreamEngine.execute(
        prompt,
        model,
        presetId,
        auth,
        docCtx,
        bubble,
        industrialSystemPrompt,
        customOnChunk
      );

      // Finalize Layout Orchestration
      if (intelligenceSteps[4]) intelligenceSteps[4].status = "done";
      HistoryManager.updateAssistantSteps(bubble, intelligenceSteps);

      // 4. Action Execution: [IRON-CLAD AUTO-FACTORY]
      // Use case-insensitive multi-lingual detection for slide structures
      const hasSlides = /---Slide|投影片|\[標題\]|頁|Page/i.test(res.text);
      console.log(
        `[Zenith Dispatcher] Slide structure detection: ${hasSlides} (Host: ${docCtx.host})`
      );

      if (docCtx.host === "PowerPoint" && hasSlides) {
        Toast.show("MANUFACTURING_SLIDES...", "info");
        // Use common industrial pattern for triggering factory
        const slideCount = await applyUniversalOfficeActions(
          [{ type: "INSERT", value: res.text }],
          res.text
        );

        if (typeof slideCount === "number" && slideCount > 0) {
          Toast.show("SLIDES_COMPLETED", "success");
          const report = `\n\n✅ **NEXUS REPORT**: Successfully generated and presented **${slideCount}** slides. All elements formatted with 2026 Industrial Tokens.`;
          HistoryManager.updateAssistantBubble(bubble, res.text + report, (t) => t);
        } else {
          console.warn(
            "[Zenith Dispatcher] Factory triggered but 0 slides produced. Fallback to manual."
          );
        }
      }

      // 5. Normal UI Action Rendering
      const finalActions: OfficeAction[] = [...(res.actions || [])];
      if (!finalActions.some((a) => a.type === "INSERT")) {
        finalActions.push({
          type: "INSERT",
          text: "Paste to Office",
          icon: "edit",
          value: res.text,
        });
      }
      if (!finalActions.some((a) => a.type === "COPY")) {
        finalActions.push({ type: "COPY", text: "Copy Content", icon: "copy", value: res.text });
      }

      ChatUiHelper.renderActions(bubble, finalActions, async (type, val) => {
        if (type === "COPY") {
          await navigator.clipboard.writeText(val);
          Toast.show("COPIED_TO_CLIPBOARD", "success");
          return;
        }
        await applyUniversalOfficeActions([{ type, value: val }], val);
      });

      CircuitBreaker.recordSuccess(provider as NexusProvider);
      return res.text || "";
    } catch (error: unknown) {
      CircuitBreaker.recordFailure(auth.getAuthProvider() as NexusProvider);
      const msg = `Error: ${this.getErrorMessage(error)}`;
      ChatUiHelper.renderError(ctx.historyEl as HTMLElement, msg);
      return "";
    } finally {
      this.isGenerating = false;
      ChatUiHelper.finalize(ctx);
    }
  }

  private async handlePreview(bubble: HTMLElement): Promise<string> {
    HistoryManager.removeTypingIndicator();
    const txt = "Preview Mode: Simulated Nexus response.";
    ChatUiHelper.updateAssistantBubble(bubble, txt, (t) => t);
    ChatUiHelper.completeAssistantBubble(bubble, txt);
    return txt;
  }
}
