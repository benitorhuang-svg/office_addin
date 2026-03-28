import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Elegant Skill Invoker (ESI)
 * Dispatches AI agent requests to specialized Python sub-systems.
 */
export class ElegantSkillInvoker {
    /**
     * Invoke the WordExpert skill for high-fidelity document transformation.
     */
    static async invokeWordExpert(inputPath: string, outputPath: string, changes: unknown[]) {
        const pythonScript = path.join(__dirname, "word_expert.py");
        
        return new Promise((resolve, reject) => {
            const pyProcess = spawn("python3", [pythonScript]);
            
            let stdout = "";
            let stderr = "";
            
            // Standard ACP Protocol Data Pipe
            const payload = JSON.stringify({
                input: inputPath,
                output: outputPath,
                changes: changes
            });
            
            pyProcess.stdin.write(payload);
            pyProcess.stdin.end();
            
            pyProcess.stdout.on("data", (data) => (stdout += data.toString()));
            pyProcess.stderr.on("data", (data) => (stderr += data.toString()));
            
            pyProcess.on("close", (code) => {
                if (code !== 0) {
                    reject(new Error(`Python Skill Error: ${stderr}`));
                } else {
                    try {
                        resolve(JSON.parse(stdout));
                    } catch (_e) {
                        reject(new Error("Failed to parse Skill Output JSON"));
                    }
                }
            });
        });
    }

    /**
     * Elegant RAG: Invoke VectorNexus for high-fidelity semantic retrieval.
     */
    static async invokeVectorSearch(apiKey: string, query: string, docs: string[]) {
        const pythonScript = path.join(__dirname, "vector_nexus.py");
        
        return new Promise((resolve, reject) => {
            const pyProcess = spawn("python3", [pythonScript]);
            
            let stdout = "";
            let stderr = "";
            
            // Industrial-grade JSON-over-STDIN protocol
            const payload = JSON.stringify({
                apiKey: apiKey,
                query: query,
                docs: docs
            });
            
            pyProcess.stdin.write(payload);
            pyProcess.stdin.end();
            
            pyProcess.stdout.on("data", (data) => (stdout += data.toString()));
            pyProcess.stderr.on("data", (data) => (stderr += data.toString()));
            
            pyProcess.on("close", (code) => {
                if (code !== 0) {
                    reject(new Error(`RAG Skill Error: ${stderr}`));
                } else {
                    try {
                        const parsed = JSON.parse(stdout);
                        if (parsed.error) reject(new Error(parsed.error));
                        else resolve(parsed.results);
                    } catch (_e) {
                        reject(new Error("Failed to parse Vector Output JSON"));
                    }
                }
            });
        });
    }
}
