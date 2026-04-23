import { createSkillExecutor } from "@agents/shared/skill-executor-factory.js";
import { WordExpertInvoker } from "./domain/word-invoker";
import type { AgentSkill } from "@agents/agent-skill.js";
import type { WordAction } from "@shared/domain-actions.js";

/**
 * Word Expert Agent (W1/W2 Optimized)
 * Version 4.0 - Brand-Aware Structural Writer
 */

export interface WordOfficeContext {
  documentText?: string;
  selectionText?: string;
  cursorPosition?: number;
  /** W1: List of styles defined in the document template (e.g. "Heading 1", "Body Text") */
  availableNamedStyles: string[];
  /** P2: List of protected paragraph ranges or IDs that should not be modified */
  protectedRanges?: Array<{ start: number; end: number; label?: string }>;
  /** P3: Brand Glossary for terminology consistency (key = forbidden/old, value = preferred) */
  glossary?: Record<string, string>;
  /** P3: Structural map of the document (headings and their ranges) */
  documentOutline?: Array<{ level: number; text: string; range: { start: number; end: number } }>;
}

export interface WordSkillParams extends Record<string, unknown> {
  output_path: string;
  changes: WordAction[];
  officeContext?: WordOfficeContext;
}

export const wordSkill: AgentSkill<WordSkillParams> = {
  name: "word_expert",
  version: "4.0 (Style-Aware)",
  description: "Generate structured documents aligned with existing brand styles.",
  parameters: {
    type: "object",
    required: ["output_path", "changes"],
    properties: {
      output_path: { type: "string", description: "Path to output" },
      changes: { type: "array", description: "List of changes", items: { type: "object" } },
      officeContext: { type: "object", description: "Context" }
    }
  },
  
  execute: createSkillExecutor<WordSkillParams>("word_expert", async (params) => {
    return await WordExpertInvoker.invokeWordExpert(
      "",
      params.output_path,
      params.changes,
      params.officeContext
    );
  })
};
