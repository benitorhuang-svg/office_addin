import path from "path";
import { fileURLToPath } from "url";
import { invokeWordSkill } from "@infra/services/bridge-client.js";
import { AppError } from "@infra/atoms/app-error.js";
import { logger } from "@shared/logger/index.js";
import type { WordOfficeContext } from "../word.tools.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Word Skill Invoker
 * Dispatches AI agent requests to the FastAPI Skill Bridge (HTTP).
 * Eliminates cold-start latency vs. spawning a new Python process per call.
 */
export class WordExpertInvoker {
    /**
     * Invoke the WordExpert skill via the skill bridge HTTP API.
     */
    static async invokeWordExpert(
        inputPath: string,
        outputPath: string,
        changes: any[],
        officeContext?: WordOfficeContext
    ): Promise<unknown> {
        // 1. Validation Layer
        if (officeContext) {
            for (const change of changes) {
                // Style whitelist validation
                if (change.style && officeContext.availableNamedStyles) {
                    if (!officeContext.availableNamedStyles.includes(change.style)) {
                        throw new AppError(`Invalid Style: '${change.style}' is not available in the document template.`, 400);
                    }
                }
                
                // Protected section check
                if (officeContext.protectedRanges && change.range) {
                    const { start, end } = change.range; // Assuming changes have range info
                    for (const protectedRange of officeContext.protectedRanges) {
                        // Intersection check: (start < protected.end) AND (end > protected.start)
                        if (start < protectedRange.end && end > protectedRange.start) {
                            throw new AppError(`Operation denied: Range [${start}, ${end}] intersects with protected section "${protectedRange.label || 'Unknown'}".`, 403);
                        }
                    }
                }

                // Structural hierarchy check (P3)
                if (officeContext.documentOutline && change.styleName?.startsWith('Heading')) {
                    const currentLevel = parseInt(change.styleName.split(' ')[1] || '1', 10);
                    // Get deepest heading in outline
                    const outline = officeContext.documentOutline;
                    const maxLevel = outline.length > 0 ? Math.max(...outline.map(o => o.level)) : 0;
                    
                    if (currentLevel > maxLevel + 1) {
                        logger.warn("WordExpertInvoker", `Heading level jump detected: H${maxLevel} -> H${currentLevel}. Correcting to H${maxLevel + 1}.`);
                        change.styleName = `Heading ${maxLevel + 1}`;
                    }
                }

                // Glossary consistency check
                if (officeContext.glossary && change.text) {
                    const corrections: string[] = [];
                    for (const [forbidden, preferred] of Object.entries(officeContext.glossary)) {
                        if (change.text.includes(forbidden)) {
                            logger.warn("WordExpertInvoker", `Terminology violation: Found '${forbidden}', preferred '${preferred}'`);
                            corrections.push(`'${forbidden}' -> '${preferred}'`);
                            change.text = change.text.replaceAll(forbidden, preferred);
                        }
                    }
                    if (corrections.length > 0) {
                      // Signal back to state if needed, or append to metadata
                      (change as any).metadata = { ...(change as any).metadata, glossaryCorrections: corrections };
                    }
                }
            }
        }

        try {
            return await invokeWordSkill({
                input_path: inputPath,
                output_path: outputPath,
                edits: changes as Record<string, unknown>[],
            });
        } catch (error: any) {
            logger.error("WordExpertInvoker", "Word bridge execution failed", { error: error.message });
            throw new AppError('WORD_BRIDGE_FAILED', 500, error.message);
        }
    }

    /**
     * Load the expert prompt for Word document operations.
     */
    static getPromptPath(): string {
        return path.join(__dirname, "..", "prompts", "word-expert.md");
    }
}
