/**
 * Excel Expert Agent
 */
import fs from "node:fs/promises";
import path from "node:path";

const __currentDir = path.resolve(process.cwd(), "src", "agents", "expert-excel");

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
