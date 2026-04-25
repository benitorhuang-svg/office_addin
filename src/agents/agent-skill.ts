/**
 * AgentSkill — Standardized interface for agent-callable skills.
 *
 * Compatible with:
 *  - OpenAI tool_call / function-calling format
 *  - GitHub Copilot agent tool definitions
 *  - Local Nexus agent (src/infra/local-agent/index.mjs)
 *
 * Folder contract (Atomic Design):
 *   agents/ = the "organisms" layer that stitches parts + services into
 *             a single callable unit with a declared schema.
 */

// ── Context ───────────────────────────────────────────────────────────────

/** Runtime context passed from the caller (LLM agent or HTTP route). */
export interface AgentSkillContext {
  /** Gemini / OpenAI API key forwarded from the request. */
  apiKey?: string;
  /** GitHub Copilot token from the agent session. */
  token?: string;
  /** Distributed trace ID for log correlation. */
  traceId?: string;
}

// ── Parameter schema ──────────────────────────────────────────────────────

export interface AgentSkillPropertyDef {
  type: "string" | "number" | "boolean" | "array" | "object";
  description: string;
  enum?: string[];
  items?: { type: string };
}

/**
 * JSON-Schema-compatible parameter declaration (object type only).
 * Matches the `parameters` field in OpenAI function-calling format.
 */
export interface AgentSkillParameterSchema {
  type: "object";
  required?: string[];
  properties: Record<string, AgentSkillPropertyDef>;
}

// ── Result ────────────────────────────────────────────────────────────────

export interface AgentSkillExample {
  input: unknown;
  output: unknown;
  reasoning?: string;
}

export interface AgentSkillResultMeta {
  durationMs?: number;
  skillName?: string;
  traceId?: string;
}

export interface AgentSkillResult<TData = unknown> {
  ok: boolean;
  data?: TData;
  error?: string;
  meta?: AgentSkillResultMeta;
}

export interface AgentSkillRationalization {
  excuse: string;
  reality: string;
}

export interface AgentSkillWorkflow {
  overview: string;
  whenToUse: string[];
  process: string[];
  rationalizations: AgentSkillRationalization[];
  redFlags: string[];
  verification: string[];
  references?: string[];
}

// ── Core interface ────────────────────────────────────────────────────────

/**
 * Any agent-callable skill must implement this interface.
 *
 * @example
 * ```ts
 * const result = await findSkill('excel_expert')?.execute(params, ctx);
 * ```
 */
export interface AgentSkill<
  TParams extends Record<string, unknown> = Record<string, unknown>,
  TData = unknown,
> {
  /** Unique machine-readable identifier (snake_case). Used as the tool `name`. */
  readonly name: string;
  /** Human/LLM-readable description of when and how to use this skill. */
  readonly description: string;
  /** Semantic version string. */
  readonly version: string;
  /** OpenAI-compatible parameter schema for LLM tool-call validation. */
  readonly parameters: AgentSkillParameterSchema;

  // ── Layer 1 Metadata (Progressive Disclosure) ───────────────────────────
  readonly trigger?: string;
  readonly logic?: string;
  readonly intent_labels?: string[];
  /** Few-shot examples for LLM learning. */
  readonly examples: AgentSkillExample[];
  /** Description of tool limitations or special boundaries. */
  readonly edge_cases?: string;
  /** Whether the tool supports parallel execution. */
  readonly parallel_safe: boolean;
  /** Structured workflow guidance for runtime injection and quality gates. */
  readonly workflow: AgentSkillWorkflow;

  /** Execute the skill with validated parameters and optional context. */
  execute(params: TParams, context?: AgentSkillContext): Promise<AgentSkillResult<TData>>;
}
