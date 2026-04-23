import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { ExcelSkillInvoker }  from "./parts/excel/index.js";
import { PPTSkillInvoker }    from "./parts/ppt/index.js";
import { WordSkillInvoker }   from "./parts/word/index.js";
import { SharedSkillInvoker } from "./shared/shared-invoker.js";
import { classifyIntent }     from "./atoms/intent-classifier.js";
import { extractBrandTokens } from "./atoms/brand-extractor.js";
import { selfCorrect }        from "./molecules/self-corrector.js";
import { chunkAndRetrieve }   from "./molecules/context-chunker.js";
import { logger }             from "../core/atoms/logger.js";

const TAG = "SkillOrchestrator";
/** Resolve the skills directory relative to cwd (project root) OR this file's location. */
const SKILLS_MANIFEST = path.resolve(process.cwd(), "backend", "skills", "skills-manifest.json");

/**
 * SkillOrchestrator: The Brain of the Nexus Center.
 * PR-011: Routes queries via LLM intent classification (with keyword fallback).
 * Huashu: PPT/Word outputs are gated through the 5-Dimension DesignReviewer before return.
 * Huashu: Brand Intelligence extraction available via "brand:" query prefix.
 * Routes queries to the correct domain-specific skill module:
 *   excel/  — spreadsheet & data operations
 *   ppt/    — slide design & presentation
 *   word/   — document writing & editing
 *   shared/ — cross-host utilities (vector search, graph, vision, bridge)
 */
export class SkillOrchestrator {
    private manifestPromise: Promise<void>;

    constructor() {
        this.manifestPromise = this.init();
    }

    private async init() {
        try {
            await fs.promises.readFile(SKILLS_MANIFEST, "utf-8");
        } catch (err) {
            logger.error(TAG, "Manifest load failed", err);
        }
    }

    private async ensureReady() {
        await this.manifestPromise;
    }

    private async loadPrompt(promptPath: string): Promise<string> {
        try {
            return await fs.promises.readFile(promptPath, "utf-8");
        } catch {
            return "";
        }
    }

    /**
     * PR-011: LLM-based routing via classifyIntent (keyword fallback built-in).
     * Huashu: brand_intel shortcut — query prefix "brand: <url>"
     * Huashu: PPT/Word outputs carry designReview metadata for the client to display.
     * P4: Generates a traceId for cross-service chain tracing (Node → Python bridge).
     */
    async route(query: string, context: { apiKey: string; docs: string[]; repo?: string; token?: string; traceId?: string; officeContext?: { documentText?: string; activeSheet?: string; selectionData?: unknown; host?: string }; actionHistory?: Array<{ action: string; prompt: string; timestamp: number }> }) {
        const traceId = context.traceId ?? randomUUID();
        const log = logger.withTrace(traceId);
        await this.ensureReady();

        // --- Brand Intelligence shortcut ---
        const brandMatch = query.match(/^brand:\s*(https:\/\/\S+)/i);
        if (brandMatch) {
            const result = await extractBrandTokens(brandMatch[1]);
            return { status: "brand_tokens_extracted", traceId, ...result };
        }

        // Classify intent — uses LLM when token provided, otherwise keywords
        const intent = await classifyIntent(query, { token: context.token });
        log.info(TAG, `Routed to [${intent}]`, { query: query.slice(0, 120) });

        switch (intent) {
            case "galaxy_graph": {
                return SharedSkillInvoker.invokeGalaxyGraph(query, context.repo);
            }

            case "vision": {
                return { status: "vision_initiated" };
            }

            case "dev_sync": {
                return { status: "github_sync_requested" };
            }

            case "ppt": {
                const rawPrompt = await this.loadPrompt(PPTSkillInvoker.getPromptPath());
                // Auto-Healing: gate PPT output through 5-Dimension DesignReview
                const pptResult = await selfCorrect(
                    async (p) => p,          // prompt augmentation mode — content IS the prompt
                    rawPrompt,
                    { domain: "ppt", traceId },
                );
                return {
                    status: "prompt_augmented",
                    category: "ppt_design",
                    prompt: pptResult.content,
                    designReview: {
                        score: pptResult.review.totalScore,
                        passed: pptResult.review.passed,
                        hints: pptResult.review.allIssues.slice(0, 3),
                        healed: pptResult.healed,
                        firstPassScore: pptResult.firstPassScore,
                    },
                };
            }

            case "excel": {
                const expertPrompt = await this.loadPrompt(ExcelSkillInvoker.getPromptPath());
                return { status: "prompt_augmented", category: "excel_data", prompt: expertPrompt };
            }

            case "word": {
                const rawWordPrompt = await this.loadPrompt(WordSkillInvoker.getPromptPath());
                // Auto-Healing: gate Word output through 5-Dimension DesignReview
                const wordResult = await selfCorrect(
                    async (p) => p,
                    rawWordPrompt,
                    { domain: "word", traceId },
                );
                return {
                    status: "prompt_augmented",
                    category: "word_creative",
                    prompt: wordResult.content,
                    designReview: {
                        score: wordResult.review.totalScore,
                        passed: wordResult.review.passed,
                        hints: wordResult.review.allIssues.slice(0, 3),
                        healed: wordResult.healed,
                        firstPassScore: wordResult.firstPassScore,
                    },
                };
            }

            case "cross_app": {
                const expertPrompt = await this.loadPrompt(SharedSkillInvoker.getOmniBridgePromptPath());
                return { status: "prompt_augmented", category: "omni_bridge", prompt: expertPrompt };
            }

            case "recap": {
                // Session Checkpoint: summarise action history into a Milestone Report
                const history = context.actionHistory ?? [];
                const historyText = history
                    .slice(-5)
                    .map((h, i) => `[${i + 1}] ${new Date(h.timestamp).toLocaleTimeString()} — ${h.action}: ${h.prompt.slice(0, 80)}`)
                    .join('\n');

                const recapPrompt = [
                    'You are a session milestone analyst for the Nexus Office Add-in.',
                    'Review the following action history and produce a concise Milestone Report.',
                    'Format: ## Completed Changes\n<list>\n## Unresolved Issues\n<list>',
                    '',
                    '### Action History (most recent 5)',
                    historyText || '(no history provided)',
                ].join('\n');

                return {
                    status: 'recap_ready',
                    category: 'session_checkpoint',
                    prompt: recapPrompt,
                    historyCount: history.length,
                };
            }

            case "insight": {
                // Content-Aware Insight: analyse the current document/sheet state
                const octx = context.officeContext ?? {};
                const rawText = octx.documentText ?? '';
                const host = octx.host ?? 'unknown';

                // Apply smart chunking so we don't overflow token budget
                const { context: safeContext, chunked } = chunkAndRetrieve(rawText, query, undefined, traceId);

                const isExcel = /excel/i.test(host) || octx.activeSheet !== undefined;
                const insightPrompt = isExcel
                    ? [
                        'You are an Excel data analyst. Analyse the following spreadsheet content.',
                        'Produce: ## Data Insights (top observations) and ## Potential Outliers.',
                        '',
                        '### Spreadsheet Content',
                        safeContext || '(no document content provided)',
                    ].join('\n')
                    : [
                        'You are a professional document analyst. Analyse the following document.',
                        'Produce: ## Document Structure Summary, ## Argument Completeness (0–100%), ## Recommended Next Steps.',
                        '',
                        '### Document Content',
                        safeContext || '(no document content provided)',
                    ].join('\n');

                return {
                    status: 'insight_ready',
                    category: isExcel ? 'excel_insight' : 'word_insight',
                    prompt: insightPrompt,
                    contextChunked: chunked,
                };
            }

            default: {
                // vector_search — default
                return SharedSkillInvoker.invokeVectorSearch(context.apiKey, query, context.docs);
            }
        }
    }
}

// Named domain exports for direct consumption by route handlers
export { ExcelSkillInvoker, PPTSkillInvoker, WordSkillInvoker, SharedSkillInvoker };

