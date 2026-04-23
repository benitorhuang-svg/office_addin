import { defineTool, type Tool } from "@github/copilot-sdk";
import { execFile } from "child_process";
import { promisify } from "util";
import { writeFile, unlink } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import { randomUUID } from "crypto";
import { logger } from "../../../../core/atoms/logger.js";

const execFileAsync = promisify(execFile);
const PYTHON_TOOL_TIMEOUT_MS = Number(process.env.PYTHON_TOOL_TIMEOUT_MS || 15000);
const PYTHON_TOOL_MAX_BUFFER_BYTES = Number(process.env.PYTHON_TOOL_MAX_BUFFER_BYTES || 1024 * 1024);

export function createPythonExecutorTool(): Tool<{ code: string }> {
  return defineTool("python_executor", {
    description: "Executes industrial Python code for CAGR calculation, trend analysis, and data restructuring. Essential for logic verification.",
    parameters: {
      type: "object",
      properties: {
        code: { type: "string", description: "Python source code to execute" },
      },
      required: ["code"],
    },
    handler: async ({ code }) => {
      const tmpFile = join(tmpdir(), `nexus_script_${randomUUID()}.py`);

      try {
        logger.info("ToolRegistry", "Staging python_executor script", {
          tmpFile,
          timeoutMs: PYTHON_TOOL_TIMEOUT_MS,
        });
        await writeFile(tmpFile, code, "utf-8");

        const { stdout, stderr } = await execFileAsync("python", [tmpFile], {
          timeout: PYTHON_TOOL_TIMEOUT_MS,
          maxBuffer: PYTHON_TOOL_MAX_BUFFER_BYTES,
          windowsHide: true,
        });
        const output = (stdout + (stderr || "")).trim();

        if (output.includes("[BRIDGE_DISPATCH]: EXCEL_CHART")) {
          const commandLines = output.split("\n").filter((line) => line.includes("[BRIDGE_DISPATCH]: EXCEL_CHART"));
          const { NexusSocketRelay } = await import("../../../molecules/nexus-socket.js");

          commandLines.forEach((line, index) => {
            const parts = line.split("|").map((part) => part.trim());
            if (parts.length >= 3) {
              const title = parts[1];
              const type = parts[2];
              const range = parts[3] || "AUTO";

              logger.info("ToolRegistry", "Dispatching chart from python bridge", {
                index,
                total: commandLines.length,
                title,
                chartType: type,
              });

              NexusSocketRelay.broadcast("EXCEL_CHART_EXTERNAL", { title, chartType: type, range, index });
            }
          });
        }

        return output || "Execution successful (no standard output).";
      } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error(String(err));
        logger.error("ToolRegistry", "python_executor failed", {
          tmpFile,
          error,
        });
        return `Runtime Error: ${error.message}`;
      } finally {
        try {
          await unlink(tmpFile);
        } catch (cleanupError) {
          logger.warn("ToolRegistry", "Failed to cleanup python temp file", {
            tmpFile,
            error: cleanupError,
          });
        }
      }
    },
  });
}

