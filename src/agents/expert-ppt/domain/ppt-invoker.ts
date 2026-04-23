import path from "path";
import { fileURLToPath } from "url";
import { invokePPTSkill } from "@infra/services/bridge-client.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * PPT Skill Invoker
 * Dispatches AI agent requests to the FastAPI Skill Bridge (HTTP).
 * Eliminates cold-start latency vs. spawning a new Python process per call.
 */
export class PPTSkillInvoker {
    /**
     * Invoke the PPTExpert skill via the skill bridge HTTP API.
     */
    static async invokePPTExpert(
        inputPath: string,
        outputPath: string,
        changes: unknown[]
    ): Promise<unknown> {
        return invokePPTSkill({
            input_path: inputPath,
            output_path: outputPath,
            slides: changes as Record<string, unknown>[],
        });
    }

    /**
     * Load the expert prompt for PPT design operations.
     */
    static getPromptPath(): string {
        return path.join(__dirname, "..", "prompts", "ppt-master.md");
    }
}
