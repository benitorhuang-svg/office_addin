import path from "path";
import { fileURLToPath } from "url";
import { invokeExcelSkill } from "@infra/services/bridge-client.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Excel Skill Invoker
 * Dispatches AI agent requests to the FastAPI Skill Bridge (HTTP).
 * Eliminates cold-start latency vs. spawning a new Python process per call.
 */
export class ExcelSkillInvoker {
    /**
     * Invoke the ExcelExpert skill via the skill bridge HTTP API.
     */
    static async invokeExcelExpert(
        inputPath: string,
        outputPath: string,
        changes: unknown[],
        _officeContext?: unknown
    ): Promise<unknown> {
        return invokeExcelSkill({
            input_path: inputPath,
            output_path: outputPath,
            changes: changes as Record<string, unknown>[],
        });
    }

    /**
     * Load the expert prompt for Excel operations.
     */
    static getPromptPath(): string {
        return path.join(__dirname, "..", "prompts", "excel-expert.md");
    }
}
