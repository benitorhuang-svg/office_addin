/**
 * Multi-Agent Workflow Graph (System Brain)
 * Coordinates high-level AI tasks using a directed graph/state machine approach.
 *
 * Flow: User Request -> Router Agent -> Execution (Expert) -> QA Review -> Egress
 */

import { RouterAgent } from "@agents/router-agent/index.js";
import { QAReviewerAgent } from "@agents/qa-reviewer/index.js";
import { globalStateManager } from "./state-manager.js";
import { eventBus } from "@shared/event-bus/index.js";
import { logger } from "@shared/logger/index.js";
import { randomUUID } from "crypto";
import { SdkTurnOrchestrator } from "@shared/molecules/ai-core/sdk-turn-orchestrator.js";
import { SdkRetryEngine } from "@shared/molecules/ai-core/sdk-retry-engine.js";
import { resolveMethodFromContext } from "@shared/molecules/ai-core/option-resolver.js";
import {
  resolveInput,
  clearAllPendingInputs,
} from "@shared/molecules/ai-core/pending-input-queue.js";
import { stopAllClients } from "@shared/molecules/ai-core/client-manager.js";
import { cleanupAllSessions } from "@shared/molecules/ai-core/session-lifecycle.js";
import { checkAgentHealth } from "@shared/molecules/ai-core/organisms/health-prober.js";
import type {
  ACPConnectionMethod,
  AzureInfo,
  ACPSessionConfig,
  OfficeContext,
} from "@shared/atoms/ai-core/types.js";
import config from "@config/molecules/server-config.js";

// Import Expert Getters
import {
  excelSkill,
  getCoreInstructions as getExcelInstructions,
} from "@agents/expert-excel/index.js";
import {
  wordSkill,
  getCoreInstructions as getWordInstructions,
} from "@agents/expert-word/index.js";
import { pptSkill, getCoreInstructions as getPPTInstructions } from "@agents/expert-ppt/index.js";
import { renderSkillWorkflowGuide } from "@agents/shared/workflow-skill-packet.js";

const TAG = "WorkflowGraph";

export class WorkflowGraph {
  /**
   * Main entry point for a multi-agent orchestrated task.
   */
  public static async executeTask(
    sessionId: string,
    prompt: string,
    onChunk?: (chunk: string) => void,
    isExplicitCli: boolean = false,
    modelName: string = config.COPILOT_MODEL,
    azureInfo?: AzureInfo,
    methodOverride?: ACPConnectionMethod,
    geminiKey?: string,
    officeContext?: OfficeContext,
    signal?: AbortSignal
  ): Promise<string> {
    const traceId = randomUUID();
    const log = logger.withTrace(traceId);

    log.info(TAG, `Starting task execution graph for session ${sessionId}`);
    await eventBus.emit("TASK_STARTED", { sessionId, prompt, traceId });

    // 1. Setup Global State
    let state = globalStateManager.getState(sessionId);
    if (!state) {
      state = globalStateManager.createState(sessionId, officeContext);
    }

    globalStateManager.updateState(sessionId, { status: "planning", currentTask: prompt });

    try {
      // 2. Routing: Analyze intent and break down task (Parallel Optimization)
      const routeResult = await RouterAgent.analyzeIntent(prompt, { traceId });

      globalStateManager.recordAction(sessionId, {
        agent: "router",
        action: "analyze_intent",
        payload: { query: prompt },
        result: routeResult,
      });

      globalStateManager.updateState(sessionId, { status: "executing" });

      // 3. Execution (With QA Review Loop)
      const method =
        methodOverride || resolveMethodFromContext(modelName, azureInfo, isExplicitCli);

      const acpConfig: ACPSessionConfig = {
        method,
        model: modelName,
        streaming: !!onChunk,
        azure: azureInfo,
        remotePort: config.COPILOT_AGENT_PORT || undefined,
        geminiKey,
        officeContext,
      };

      // Composite Prompting: Combine all relevant expert instructions
      const instructionTasks = routeResult.domains.map(async (domain) => {
        if (domain === "expert-excel") {
          return renderSkillWorkflowGuide(excelSkill, await getExcelInstructions());
        }
        if (domain === "expert-word") {
          return renderSkillWorkflowGuide(wordSkill, await getWordInstructions());
        }
        if (domain === "expert-ppt") {
          return renderSkillWorkflowGuide(pptSkill, await getPPTInstructions());
        }
        return "";
      });

      const instructions = (await Promise.all(instructionTasks)).filter(Boolean);
      const compositeSystemPrompt =
        instructions.length > 0
          ? `[NEXUS MULTI-AGENT COMPOSITE SYSTEM PROMPT]\n\n${instructions.join("\n\n---\n\n")}`
          : "";

      const generator = async (p: string) => {
        // We prepend the composite instructions if available
        const finalPrompt = compositeSystemPrompt
          ? `${compositeSystemPrompt}\n\nUSER REQUEST: ${p}`
          : p;

        const result = await SdkRetryEngine.executeWithRetry(
          () =>
            SdkTurnOrchestrator.executeTurn(
              finalPrompt,
              modelName,
              method,
              acpConfig,
              onChunk,
              signal
            ),
          method,
          acpConfig,
          onChunk
        );
        return result as string;
      };

      let finalContent: string;

      // Determine QA domains (Parallel Review)
      const qaDomains: Array<"ppt" | "word" | "excel"> = [];
      if (routeResult.domains.includes("expert-ppt")) qaDomains.push("ppt");
      if (routeResult.domains.includes("expert-word")) qaDomains.push("word");
      if (routeResult.domains.includes("expert-excel")) qaDomains.push("excel");

      if (qaDomains.length > 0) {
        log.info(TAG, `Routing through QA Reviewer for domains [${qaDomains.join(", ")}]`);
        globalStateManager.updateState(sessionId, { status: "reviewing" });

        if (qaDomains.length > 1) {
          log.info(TAG, "Executing parallel multi-domain review.");
          // Parallel execution logic for multiple domains
          const reviewTasks = qaDomains.map(async (domain) => {
            return await QAReviewerAgent.enforceQuality(generator, prompt, {
              domain,
              traceId,
            });
          });
          const results = await Promise.all(reviewTasks);
          finalContent = results.map((r) => r.content).join("\n\n---\n\n");

          globalStateManager.recordAction(sessionId, {
            agent: "qa-reviewer",
            action: "parallel_review",
            payload: { domains: qaDomains },
            result: "success",
          });
        } else {
          const primaryDomain = qaDomains[0];
          if (primaryDomain) {
            const qaResult = await QAReviewerAgent.enforceQuality(generator, prompt, {
              domain: primaryDomain,
              traceId,
            });
            finalContent = qaResult.content;

            globalStateManager.recordAction(sessionId, {
              agent: "qa-reviewer",
              action: "review_design",
              payload: { domains: qaDomains },
              result: qaResult,
            });
          } else {
            // Fallback for safety
            finalContent = await generator(prompt);
          }
        }
      } else {
        log.info(TAG, `Direct execution for generic intent (no specific QA gating)`);
        // 修正這裡：直接呼叫 generator
        finalContent = await generator(prompt);

        globalStateManager.recordAction(sessionId, {
          agent: "expert",
          action: "execute",
          payload: { domains: routeResult.domains, prompt },
          result: "success",
        });
      }
      globalStateManager.updateState(sessionId, { status: "completed", currentTask: undefined });
      log.info(TAG, `Task execution completed successfully`);

      await eventBus.emit("TASK_COMPLETED", { sessionId, traceId });
      return finalContent;
    } catch (error) {
      log.error(TAG, "Workflow Graph encountered an error", error);
      globalStateManager.updateState(sessionId, {
        status: "error",
        error: error instanceof Error ? error.message : String(error),
      });

      await eventBus.emit("TASK_FAILED", { sessionId, error: String(error), traceId });
      throw error;
    }
  }
}

// Keeping the backward compatible entrypoint for existing route handlers
export class ModernSDKOrchestrator {
  public static async cleanup(): Promise<void> {
    await cleanupAllSessions();
    clearAllPendingInputs();
    await stopAllClients();
  }

  public static resolveInput(sessionId: string, answer: string): boolean {
    return resolveInput(sessionId, answer);
  }

  public static async healthCheck(): Promise<Record<string, boolean>> {
    const health = await checkAgentHealth();
    return { [health.type || "unknown"]: !!health.ok };
  }

  public static async sendPrompt(
    prompt: string,
    onChunk?: (chunk: string) => void,
    isExplicitCli: boolean = false,
    modelName: string = config.COPILOT_MODEL,
    azureInfo?: AzureInfo,
    methodOverride?: ACPConnectionMethod,
    geminiKey?: string,
    officeContext?: OfficeContext,
    signal?: AbortSignal,
    sessionId?: string // Accept optional sessionId
  ): Promise<string> {
    // Generate an ephemeral session ID if none provided
    const targetSession = sessionId || randomUUID();
    return WorkflowGraph.executeTask(
      targetSession,
      prompt,
      onChunk,
      isExplicitCli,
      modelName,
      azureInfo,
      methodOverride,
      geminiKey,
      officeContext,
      signal
    );
  }
}
