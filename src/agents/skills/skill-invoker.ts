/**
 * ElegantSkillInvoker — Central façade that delegates to domain-specific invokers.
 * Import from the individual domain modules for direct access.
 */
// Domain entrypoints (via parts layer)

// Re-export through the new `parts` layer for clearer domain separation.
export { ExcelSkillInvoker } from "@agents/expert-excel/index.js";
export { PPTSkillInvoker }   from "@agents/expert-ppt/index.js";
export { WordSkillInvoker }  from "@agents/expert-word/index.js";
export { SharedSkillInvoker } from "./shared/shared-invoker.js";

// Agent-callable skill registry (OpenAI / Copilot tool-call compatible)
export {
  excelSkill,
  pptSkill,
  wordSkill,
  findSkill,
  getAllSkills,
  getToolDefinitions,
} from "@agents/index.js";
export type { AgentSkill, AgentSkillContext, AgentSkillResult } from "@agents/index.js";

// ---- Legacy imports for backward compatibility within this module ----
import { WordSkillInvoker }   from "@agents/expert-word/index.js";
import { SharedSkillInvoker } from "@agents/skills/shared/shared-invoker.js";

export class ElegantSkillInvoker {
    static invokeWordExpert(inputPath: string, outputPath: string, changes: unknown[]) {
        return WordSkillInvoker.invokeWordExpert(inputPath, outputPath, changes);
    }

    static invokeVectorSearch(apiKey: string, query: string, docs: string[]) {
        return SharedSkillInvoker.invokeVectorSearch(apiKey, query, docs);
    }
}
