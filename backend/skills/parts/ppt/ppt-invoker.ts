import path from "path";
import { fileURLToPath } from "url";
import { invokePPTSkill } from "../../services/bridge-client.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * PPT Skill Invoker
 * Dispatches AI agent requests to the FastAPI Skill Bridge (HTTP).
 * Eliminates cold-start latency vs. spawning a new Python process per call.
 */
export class PPTSkillInvoker {
    /**
     * Invoke the PPTMaster skill via the skill bridge HTTP API.
     */
    static async invokePPTMaster(
        inputPath: string,
        outputPath: string,
        slides: unknown[]
    ): Promise<unknown> {
        return invokePPTSkill({
            input_path: inputPath,
            output_path: outputPath,
            slides: slides as Record<string, unknown>[],
        });
    }

    /**
     * Load the expert prompt for PPT design operations.
     */
    static getPromptPath(): string {
        return path.join(__dirname, "prompts", "ppt-master.md");
    }
}
