import type { AgentSkillContext, AgentSkillResult } from "@agents/agent-skill.js";
import { logger } from "@shared/logger/index.js";

/**
 * Factory: createSkillExecutor
 * P2 Optimized: Consolidates boilerplate try-catch, timing, and result mapping.
 * Reduces code duplication across Excel, Word, and PPT skills.
 */
export function createSkillExecutor<T extends Record<string, unknown>>(
  skillName: string,
  invoke: (params: T) => Promise<unknown>
): (params: T, ctx?: AgentSkillContext) => Promise<AgentSkillResult> {
  return async (params: T, ctx?: AgentSkillContext) => {
    const start = Date.now();
    try {
      const data = await invoke(params);
      return {
        ok: true,
        data,
        meta: {
          durationMs: Date.now() - start,
          skillName,
          traceId: ctx?.traceId,
        },
      };
    } catch (err) {
      logger.error("SkillExecutor", `Skill ${skillName} failed`, { error: err, traceId: ctx?.traceId });
      return {
        ok: false,
        error: err instanceof Error ? err.message : String(err),
        meta: { skillName, traceId: ctx?.traceId },
      };
    }
  };
}
