/**
 * Excel Expert Agent
 */
import fs from "node:fs/promises";
import path from "node:path";

import { logger } from "@shared/logger/index.js";

const __currentDir = path.resolve(process.cwd(), "src", "agents", "expert-excel");

let cachedInstructions: string | null = null;

// P0 Fix: Missing exports for tools and invoker
export * from "./excel.tools";
export { ExcelSkillInvoker } from "./domain/excel-invoker";

/**
 * Load the Layer 2 Core Instructions for Excel Expert.
 * P2 Optimized: Cache empty string on failure to prevent repeated Disk I/O.
 */
export async function getCoreInstructions(): Promise<string> {
  if (cachedInstructions !== null) return cachedInstructions;

  const promptPath = path.join(__currentDir, "prompts", "excel-expert.md");
  try {
    const content = await fs.readFile(promptPath, "utf-8");
    cachedInstructions = content;
    return content;
  } catch (err) {
    const error = err as Error;
    logger.warn("ExcelExpertIndex", "Failed to load core instructions from disk", {
      error: error.message,
    });
    cachedInstructions = ""; // Cache failure as empty string
    return "";
  }
}
