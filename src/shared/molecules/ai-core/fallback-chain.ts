/**
 * Molecule: Fallback Chain
 * Executes an async operation with sequential model fallback on failure.
 */

import { logger } from "@shared/logger/index.js";

interface FallbackResult<T> {
  result: T;
  model: string;
  fallbackUsed: boolean;
  attempts: number;
}

export class FallbackChain {
  private models: string[];

  constructor(models: string[]) {
    this.models = models;
  }

  async execute<T>(fn: (model: string) => Promise<T>): Promise<FallbackResult<T>> {
    let lastError: Error | null = null;

    for (let i = 0; i < this.models.length; i++) {
      const model = this.models[i];
      if (!model) continue;
      try {
        const result = await fn(model);
        return {
          result,
          model,
          fallbackUsed: i > 0,
          attempts: i + 1,
        };
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          throw err;
        }

        lastError = err as Error;
        logger.warn("FallbackChain", "Model fallback attempt failed", {
          model,
          attempt: i + 1,
          totalAttempts: this.models.length,
          error: lastError.message,
        });
      }
    }

    throw lastError || new Error("FallbackChain: all models exhausted");
  }

  static fromEnv(): FallbackChain | null {
    const raw = process.env.FALLBACK_MODELS;
    if (!raw) return null;
    const models = raw
      .split(",")
      .map((m) => m.trim())
      .filter(Boolean);
    return models.length > 1 ? new FallbackChain(models) : null;
  }
}
