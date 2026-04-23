import { ExcelSkillInvoker } from "@agents/expert-excel/index";
import { PPTSkillInvoker } from "@agents/expert-ppt/index";
import { WordSkillInvoker } from "@agents/expert-word/index";
import { SharedSkillInvoker } from "./shared/shared-invoker";

/**
 * ElegantSkillInvoker — Central façade that delegates to domain-specific invokers.
 * This is the unified entry point for all skill executions.
 */
export class ElegantSkillInvoker {
    /**
     * Invoke the ExcelExpert skill.
     */
    static async invokeExcel(inputPath: string, outputPath: string, changes: unknown[], officeContext?: unknown) {
        return ExcelSkillInvoker.invokeExcelExpert(inputPath, outputPath, changes, officeContext);
    }

    /**
     * Invoke the PPTExpert skill.
     */
    static async invokePPT(inputPath: string, outputPath: string, changes: unknown[], officeContext?: unknown) {
        return PPTSkillInvoker.invokePPTExpert(inputPath, outputPath, changes, officeContext);
    }

    /**
     * Invoke the WordExpert skill.
     */
    static async invokeWord(inputPath: string, outputPath: string, changes: unknown[], officeContext?: unknown) {
        return WordSkillInvoker.invokeWordExpert(inputPath, outputPath, changes, officeContext);
    }

    /**
     * Invoke shared utility skills (Vector Search, etc.)
     */
    static async invokeVectorSearch(apiKey: string, query: string, docs: string[]) {
        return SharedSkillInvoker.invokeVectorSearch(apiKey, query, docs);
    }

    static async invokeGalaxyGraph(query: string, repo?: string) {
        return SharedSkillInvoker.invokeGalaxyGraph(query, repo);
    }
}
