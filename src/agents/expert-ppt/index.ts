/**
 * PPT Expert Agent
 */
import fs from "node:fs/promises";
import path from "node:path";

const __currentDir = path.resolve(process.cwd(), "src", "agents", "expert-ppt");

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
