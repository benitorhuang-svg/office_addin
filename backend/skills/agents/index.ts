/**
 * Agent Skill Registry
 *
 * Central discovery point for all agent-callable skills.
 * Produces OpenAI / GitHub Copilot compatible tool definitions.
 *
 * Usage:
 *   import { findSkill, getToolDefinitions } from './agents/index.js';
 *
 *   // Execute a skill
 *   const result = await findSkill('excel_expert')?.execute(params, ctx);
 *
 *   // Pass tool definitions to an LLM
 *   const tools = getToolDefinitions();
 */
import { excelSkill } from "./excel-skill.js";
import { pptSkill }   from "./ppt-skill.js";
import { wordSkill }  from "./word-skill.js";

import type { AgentSkill } from "./agent-skill.js";

// ── Registry ──────────────────────────────────────────────────────────────

const REGISTRY = new Map<string, AgentSkill>([
  [excelSkill.name, excelSkill],
  [pptSkill.name,   pptSkill],
  [wordSkill.name,  wordSkill],
]);

/** Return all registered skills. */
export function getAllSkills(): AgentSkill[] {
  return [...REGISTRY.values()];
}

/** Look up a skill by its machine-readable name. Returns undefined if not found. */
export function findSkill(name: string): AgentSkill | undefined {
  return REGISTRY.get(name);
}

/** Register a custom skill at runtime (for testing or plugins). */
export function registerSkill(skill: AgentSkill): void {
  REGISTRY.set(skill.name, skill);
}

// ── OpenAI / Copilot tool definitions ────────────────────────────────────

export interface ToolDefinition {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: AgentSkill["parameters"];
  };
}

/**
 * Returns OpenAI function-calling / GitHub Copilot tool definitions
 * for all registered skills.
 *
 * Pass directly to `tools` in a chat completion request:
 * ```ts
 * const response = await openai.chat.completions.create({
 *   model: 'gpt-4o',
 *   messages,
 *   tools: getToolDefinitions(),
 *   tool_choice: 'auto',
 * });
 * ```
 */
export function getToolDefinitions(): ToolDefinition[] {
  return getAllSkills().map((skill) => ({
    type: "function" as const,
    function: {
      name: skill.name,
      description: skill.description,
      parameters: skill.parameters,
    },
  }));
}

// ── Named re-exports ──────────────────────────────────────────────────────

export { excelSkill, pptSkill, wordSkill };
export type {
  AgentSkill,
  AgentSkillContext,
  AgentSkillResult,
  AgentSkillParameterSchema,
} from "./agent-skill.js";
export type { ExcelSkillParams } from "./excel-skill.js";
export type { PPTSkillParams }   from "./ppt-skill.js";
export type { WordSkillParams }  from "./word-skill.js";
