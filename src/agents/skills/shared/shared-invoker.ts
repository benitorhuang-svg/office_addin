import { spawn } from "child_process";
import path from "node:path";
import { invokeVectorSearch as bridgeVectorSearch } from "@infra/services/bridge-client";

const __currentDir = path.resolve(process.cwd(), "src", "agents", "skills", "shared");

/**
 * Shared Skill Invoker
 * Dispatches requests to cross-host utilities: VectorNexus, GalaxyGraph,
 * TurboSearch, TripleTierSearch, VisionExpert, CrossHostBridge.
 */
export class SharedSkillInvoker {
  private static spawn(scriptName: string, payload: unknown): Promise<unknown> {
    const pythonScript = path.join(__currentDir, scriptName);

    return new Promise((resolve, reject) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30_000); // 30s timeout

      const pyProcess = spawn("python3", [pythonScript], { signal: controller.signal });

      let stdout = "";
      let stderr = "";
      const MAX_OUTPUT_SIZE = 2 * 1024 * 1024; // 2MB limit

      pyProcess.stdin.write(JSON.stringify(payload));
      pyProcess.stdin.end();

      pyProcess.stdout.on("data", (data) => {
        if (stdout.length < MAX_OUTPUT_SIZE) {
          stdout += data.toString();
          if (stdout.length > MAX_OUTPUT_SIZE) {
            stdout = stdout.substring(0, MAX_OUTPUT_SIZE) + '...[TRUNCATED]';
          }
        }
      });

      pyProcess.stderr.on("data", (data) => {
        if (stderr.length < MAX_OUTPUT_SIZE) {
          stderr += data.toString();
          if (stderr.length > MAX_OUTPUT_SIZE) {
            stderr = stderr.substring(0, MAX_OUTPUT_SIZE) + '...[TRUNCATED]';
          }
        }
      });

      pyProcess.on("close", (code) => {
        clearTimeout(timeoutId);
        if (controller.signal.aborted) {
          return reject(new Error(`Shared Skill Error [${scriptName}]: Execution timeout after 30s`));
        }
        if (code !== 0) {
          reject(new Error(`Shared Skill Error [${scriptName}]: ${stderr}`));
        } else {
          try {
            // Parse only the last line of stdout as JSON
            const lines = stdout.trim().split('\n');
            const lastLine = lines[lines.length - 1];
            const parsed = JSON.parse(lastLine || "{}");
            if (parsed && typeof parsed === 'object' && 'error' in parsed && parsed.error) {
              reject(new Error(String(parsed.error)));
            } else {
              resolve(parsed?.results ?? parsed);
            }
          } catch (e) {
            reject(new Error(`Failed to parse ${scriptName} output JSON: ${(e as Error).message}`));
          }
        }
      });

      pyProcess.on("error", (err) => {
        clearTimeout(timeoutId);
        if (controller.signal.aborted) return;
        reject(new Error(`Shared Skill Process Error [${scriptName}]: ${err.message}`));
      });
    });
  }

  static invokeVectorSearch(_apiKey: string, query: string, docs: string[]): Promise<unknown> {
    // P1 Optimized: Use fast FastAPI bridge instead of cold-start spawn
    return bridgeVectorSearch({ query, documents: docs });
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
    return path.join(__currentDir, "prompts", "omni-bridge.md");
  }
}
