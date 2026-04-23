import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";

import { ExcelSkillInvoker } from "@agents/expert-excel/index.js";
import { PPTSkillInvoker } from "@agents/expert-ppt/index.js";
import { WordSkillInvoker } from "@agents/expert-word/index.js";
import { SharedSkillInvoker } from "@agents/skills/shared/shared-invoker.js";
import { classifyIntent } from "@agents/skills/atoms/intent-classifier.js";
import { extractBrandTokens } from "@agents/skills/atoms/brand-extractor.js";
import { chunkAndRetrieve } from "@agents/skills/molecules/context-chunker.js";
import { logger } from "@shared/logger/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TAG = "SkillOrchestrator";

/**
 * Resolve the skills directory correctly.
 * 🔴 2. Fix path and ensure single source of truth.
 */
const SKILLS_MANIFEST_PATH = path.join(__dirname, "skills-manifest.json");

/**
 * SkillOrchestrator: Legacy Orchestrator (Maintained for backward compatibility).
 * Now internally optimized and cached.
 */
export class SkillOrchestrator {
  private static promptCache = new Map<string, string>();
  private manifest: Record<string, unknown> | null = null;

  constructor() {
    this.init().catch((err) => logger.error(TAG, "Initialization failed", err));
  }

  private async init() {
    try {
      const data = await fs.readFile(SKILLS_MANIFEST_PATH, "utf-8");
      this.manifest = JSON.parse(data);
      logger.info(TAG, "Manifest loaded successfully");
    } catch (err) {
      // 🔴 2. Don't swallow critical path errors
      const msg = `CRITICAL: Failed to load skills-manifest.json at ${SKILLS_MANIFEST_PATH}`;
      logger.error(TAG, msg, err);
      throw new Error(msg);
    }
  }

  private async ensureReady() {
    if (!this.manifest) await this.init();
  }

  /**
   * 🟡 8. Memoized prompt loader to reduce Disk I/O.
   */
  private async loadPrompt(promptPath: string): Promise<string> {
    if (SkillOrchestrator.promptCache.has(promptPath)) {
      return SkillOrchestrator.promptCache.get(promptPath)!;
    }
    try {
      const content = await fs.readFile(promptPath, "utf-8");
      SkillOrchestrator.promptCache.set(promptPath, content);
      return content;
    } catch (err) {
      logger.warn(TAG, `Failed to read prompt at ${promptPath}`, err);
      return "";
    }
  }

  /**
   * Legacy route handler.
   * Note: Future code should prefer WorkflowGraph and RouterAgent.
   */
  async route(
    query: string,
    context: {
      apiKey: string;
      docs: string[];
      repo?: string;
      token?: string;
      traceId?: string;
      officeContext?: {
        documentText?: string;
        activeSheet?: string;
        selectionData?: unknown;
        host?: string;
      };
      actionHistory?: Array<{ action: string; prompt: string; timestamp: number }>;
    }
  ) {
    const traceId = context.traceId ?? randomUUID();
    const log = logger.withTrace(traceId);
    await this.ensureReady();

    const brandMatch = query.match(/^brand:\s*(https:\/\/\S+)/i);
    if (brandMatch) {
      const result = await extractBrandTokens(brandMatch[1]);
      return { status: "brand_tokens_extracted", traceId, ...result };
    }

    const intent = await classifyIntent(query, { token: context.token });
    log.info(TAG, `Routed to [${intent}]`);

    switch (intent) {
      case "galaxy_graph":
        return SharedSkillInvoker.invokeGalaxyGraph(query, context.repo);

      case "vision":
        return { status: "vision_initiated" };

      case "dev_sync":
        return { status: "github_sync_requested" };

      case "ppt": {
        const prompt = await this.loadPrompt(PPTSkillInvoker.getPromptPath());
        return { status: "prompt_augmented", category: "ppt_design", prompt };
      }

      case "excel": {
        const expertPrompt = await this.loadPrompt(ExcelSkillInvoker.getPromptPath());
        return { status: "prompt_augmented", category: "excel_data", prompt: expertPrompt };
      }

      case "word": {
        const prompt = await this.loadPrompt(WordSkillInvoker.getPromptPath());
        return { status: "prompt_augmented", category: "word_creative", prompt };
      }

      case "cross_app": {
        const expertPrompt = await this.loadPrompt(SharedSkillInvoker.getOmniBridgePromptPath());
        return { status: "prompt_augmented", category: "omni_bridge", prompt: expertPrompt };
      }

      case "recap": {
        const history = context.actionHistory ?? [];
        const historyText = history
          .slice(-5)
          .map(
            (h, i) =>
              `[${i + 1}] ${new Date(h.timestamp).toLocaleTimeString()} ?? ${h.action}: ${h.prompt.slice(0, 80)}`
          )
          .join("\n");

        const recapPrompt = [
          "You are a session milestone analyst for the Nexus Office Add-in.",
          "Review the following action history and produce a concise Milestone Report.",
          "Format: ## Completed Changes\n<list>\n## Unresolved Issues\n<list>",
          "",
          "### Action History (most recent 5)",
          historyText || "(no history provided)",
        ].join("\n");

        return {
          status: "recap_ready",
          category: "session_checkpoint",
          prompt: recapPrompt,
          historyCount: history.length,
        };
      }

      case "insight": {
        const octx = context.officeContext ?? {};
        const rawText = octx.documentText ?? "";
        const { context: safeContext, chunked } = chunkAndRetrieve(
          rawText,
          query,
          undefined,
          traceId
        );

        const isExcel = /excel/i.test(octx.host ?? "") || octx.activeSheet !== undefined;
        const insightPrompt = isExcel
          ? ["Excel analyst prompt...", safeContext].join("\n")
          : ["Document analyst prompt...", safeContext].join("\n");

        return {
          status: "insight_ready",
          category: isExcel ? "excel_insight" : "word_insight",
          prompt: insightPrompt,
          contextChunked: chunked,
        };
      }

      default:
        return SharedSkillInvoker.invokeVectorSearch(context.apiKey, query, context.docs);
    }
  }
}

export { ExcelSkillInvoker, PPTSkillInvoker, WordSkillInvoker, SharedSkillInvoker };
