import { readFile } from "node:fs/promises";

export async function loadPrompt(promptPath: string): Promise<string> {
  try {
    return await readFile(promptPath, "utf-8");
  } catch {
    return "";
  }
}

