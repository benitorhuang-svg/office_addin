/**
 * PPT Expert Agent
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __currentDir =
  typeof __dirname !== "undefined" ? __dirname : path.dirname(fileURLToPath(import.meta.url));

export * from "./ppt.tools.js";
export { PPTSkillInvoker } from "./domain/ppt-invoker.js";

/**
 * Load the Layer 2 Core Instructions for PPT Expert.
 */
export async function getCoreInstructions(): Promise<string> {
  const promptPath = path.join(__currentDir, "prompts", "ppt-master.md");
  try {
    return await fs.readFile(promptPath, "utf-8");
  } catch {
    return "";
  }
}
