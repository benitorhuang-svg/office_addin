import path from "path";
import { fileURLToPath } from "url";
import { invokeWordSkill } from "../../services/bridge-client.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Word Skill Invoker
 * Dispatches AI agent requests to the FastAPI Skill Bridge (HTTP).
 * Eliminates cold-start latency vs. spawning a new Python process per call.
 */
export class WordSkillInvoker {
    /**
     * Invoke the WordExpert skill via the skill bridge HTTP API.
     */
    static async invokeWordExpert(
        inputPath: string,
        outputPath: string,
        changes: unknown[]
    ): Promise<unknown> {
        return invokeWordSkill({
            input_path: inputPath,
            output_path: outputPath,
            edits: changes as Record<string, unknown>[],
        });
    }

    /**
     * Load the expert prompt for Word document operations.
     */
    static getPromptPath(): string {
        return path.join(__dirname, "prompts", "word-expert.md");
    }
}
