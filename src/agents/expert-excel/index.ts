/**
 * Excel Expert Agent
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __currentDir =
  typeof __dirname !== "undefined" ? __dirname : path.dirname(fileURLToPath(import.meta.url));

export * from "./excel.tools.js";
export { ExcelSkillInvoker } from "./domain/excel-invoker.js";

/**
 * Load the Layer 2 Core Instructions for Excel Expert.
 */
export async function getCoreInstructions(): Promise<string> {
  const promptPath = path.join(__currentDir, "prompts", "excel-expert.md");
  try {
    return await fs.readFile(promptPath, "utf-8");
  } catch {
    return "";
  }
}
