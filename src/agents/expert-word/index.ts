/**
 * Word Expert Agent
 */
import fs from "node:fs/promises";
import path from "node:path";

import { logger } from "@shared/logger/index.js";

const __currentDir = path.resolve(process.cwd(), "src", "agents", "expert-word");

let cachedInstructions: string | null = null;

export * from "./word.tools";
export { WordExpertInvoker as WordSkillInvoker } from "./domain/word-invoker";

/**
 * Load the Layer 2 Core Instructions for Word Expert.
 * P2 Optimized: Cache empty string on failure to prevent repeated Disk I/O.
 */
export async function getCoreInstructions(): Promise<string> {
  if (cachedInstructions !== null) return cachedInstructions;

  const promptPath = path.join(__currentDir, "prompts", "word-expert.md");
  try {
    const content = await fs.readFile(promptPath, "utf-8");
    cachedInstructions = content;
    return content;
  } catch (err: any) {
    logger.warn("WordExpertIndex", "Failed to load core instructions from disk", { error: err.message });
    cachedInstructions = ""; // Cache failure
    return "";
  }
}
