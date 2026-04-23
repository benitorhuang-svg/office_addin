import fs from 'node:fs/promises';
import path from 'node:path';
import { logger } from '@shared/logger/index.js';

/**
 * Service: Prompt Registry
 * Centralized registry for managing and caching LLM prompts.
 * Supports variable injection and lazy loading.
 */
export class PromptRegistry {
  private static cache: Map<string, string> = new Map();

  /**
   * Get a prompt by its identifier (e.g., "excel-core", "word-instructions")
   * @param id The prompt identifier
   * @param variables Optional variables to inject into the prompt
   */
  public static async getPrompt(id: string, variables: Record<string, string> = {}): Promise<string> {
    let content = this.cache.get(id);

    if (!content) {
      content = await this.loadFromDisk(id);
      this.cache.set(id, content);
    }

    return this.injectVariables(content, variables);
  }

  /**
   * Clear the prompt cache (useful for development)
   */
  public static clearCache(): void {
    this.cache.clear();
    logger.info('PromptRegistry', 'Cache cleared');
  }

  private static async loadFromDisk(id: string): Promise<string> {
    // Map IDs to specific file paths based on naming convention
    // e.g., "excel-core" -> "src/agents/expert-excel/prompts/core.instructions.md"
    const [agent, type] = id.split('-');
    const filePath = path.join(process.cwd(), 'src', 'agents', `expert-${agent}`, 'prompts', `${type}.instructions.md`);

    try {
      const data = await fs.readFile(filePath, 'utf-8');
      return data;
    } catch (err) {
      logger.error('PromptRegistry', `Failed to load prompt: ${id}`, { path: filePath, error: err });
      throw new Error(`Prompt [${id}] not found.`);
    }
  }

  private static injectVariables(template: string, variables: Record<string, string>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
      return variables[key] || `{{${key}}}`;
    });
  }
}
