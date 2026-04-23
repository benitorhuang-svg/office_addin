/**
 * Word Expert Agent
 */
import fs from "node:fs/promises";
import path from "node:path";

const __currentDir = path.resolve(process.cwd(), "src", "agents", "expert-word");

export * from "./word.tools.js";
export { WordSkillInvoker } from "./domain/word-invoker.js";

/**
 * Load the Layer 2 Core Instructions for Word Expert.
 */
export async function getCoreInstructions(): Promise<string> {
  const promptPath = path.join(__currentDir, "prompts", "word-expert.md");
  try {
    return await fs.readFile(promptPath, "utf-8");
  } catch {
    return "";
  }
}
