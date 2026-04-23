import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Shared Skill Invoker
 * Dispatches requests to cross-host utilities: VectorNexus, GalaxyGraph,
 * TurboSearch, TripleTierSearch, VisionExpert, CrossHostBridge.
 */
export class SharedSkillInvoker {
    private static spawn(scriptName: string, payload: unknown): Promise<unknown> {
        const pythonScript = path.join(__dirname, scriptName);

        return new Promise((resolve, reject) => {
            const pyProcess = spawn("python3", [pythonScript]);

            let stdout = "";
            let stderr = "";

            pyProcess.stdin.write(JSON.stringify(payload));
            pyProcess.stdin.end();

            pyProcess.stdout.on("data", (data) => (stdout += data.toString()));
            pyProcess.stderr.on("data", (data) => (stderr += data.toString()));

            pyProcess.on("close", (code) => {
                if (code !== 0) {
                    reject(new Error(`Shared Skill Error [${scriptName}]: ${stderr}`));
                } else {
                    try {
                        const parsed = JSON.parse(stdout);
                        if (parsed.error) reject(new Error(parsed.error));
                        else resolve(parsed.results ?? parsed);
                    } catch {
                        reject(new Error(`Failed to parse ${scriptName} output JSON`));
                    }
                }
            });
        });
    }

    static invokeVectorSearch(apiKey: string, query: string, docs: string[]): Promise<unknown> {
        return SharedSkillInvoker.spawn("vector_nexus.py", { apiKey, query, docs });
    }

    static invokeGalaxyGraph(query: string, repo?: string): Promise<unknown> {
        return SharedSkillInvoker.spawn("galaxy_graph.py", { query, repo });
    }

    static invokeTripleTierSearch(query: string, docs: string[]): Promise<unknown> {
        return SharedSkillInvoker.spawn("triple_tier_search.py", { query, docs });
    }

    static invokeTurboSearch(query: string, docs: string[]): Promise<unknown> {
        return SharedSkillInvoker.spawn("turbo_search.py", { query, docs });
    }

    static invokeVisionExpert(imagePath: string): Promise<unknown> {
        return SharedSkillInvoker.spawn("vision_expert.py", { imagePath });
    }

    static invokeCrossHostBridge(payload: unknown): Promise<unknown> {
        return SharedSkillInvoker.spawn("cross_host_bridge.py", { payload });
    }

    static getOmniBridgePromptPath(): string {
        return path.join(__dirname, "prompts", "omni-bridge.md");
    }
}
