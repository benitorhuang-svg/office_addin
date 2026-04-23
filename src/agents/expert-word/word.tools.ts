/**
 * WordSkill — Agent-callable wrapper for the WordExpert domain.
 */
import { WordSkillInvoker } from "@agents/expert-word/domain/word-invoker.js";
import type {
  AgentSkill,
  AgentSkillContext,
  AgentSkillResult,
} from "@agents/agent-skill.js";

// ── Param contract ────────────────────────────────────────────────────────

export interface WordSkillParams extends Record<string, unknown> {
  /** Path to the source DOCX file (omit to create a new document). */
  input_path?: string;
  /** Destination path for the output .docx file. */
  output_path: string;
  /**
   * Ordered list of document edits, e.g.:
   *   { op: "insert_heading", level: 1, text: "Executive Summary" }
   *   { op: "insert_paragraph", text: "…", style: "Normal" }
   *   { op: "find_replace", find: "{{DATE}}", replace: "2026-04-23" }
   *   { op: "apply_style", range: "all_headings", style: "Heading 1" }
   */
  changes: Array<Record<string, unknown>>;
  /** Active document context from the Office.js add-in (optional). */
  officeContext?: Record<string, unknown>;
}

// ── Skill definition ──────────────────────────────────────────────────────

export const wordSkill: AgentSkill<WordSkillParams> = {
  name: "word_expert",
  version: "3.0",
  description:
    "Document automation via the WordExpert engine: create reports, " +
    "insert headings/paragraphs, apply styles, perform find-replace, " +
    "and structure content using the Pyramid Principle. " +
    "Invoke when the user asks about Word, documents, reports, " +
    "memos, or structured text editing.",

  trigger: "Document writing, editing, and high-fidelity formatting.",
  logic: "Use when query involves Word documents, reports, memos, structured text editing, or formatting.",
  intent_labels: ["word", "document", "writing", "editing", "memo", "report"],
  example_inputs: [
    "Write an executive summary for this quarterly report",
    "Format all H2 headings in the document as bold with 14pt font",
    "Insert a table of contents at the beginning",
    "Rewrite the selected paragraph in a more formal tone",
    "Add numbered footnotes to the highlighted citations"
  ],
  example_outputs: "Returns formatted content ready to insert, or Office.js code to apply changes to the active document.",
  edge_cases: "If the document has no content (empty officeContext.documentText), ask the user what they want to write before proceeding.",
  parallel_safe: true,

  parameters: {
    type: "object",
    required: ["output_path", "changes"],
    properties: {
      input_path: {
        type: "string",
        description:
          "Source DOCX file path. Omit to create a new document.",
      },
      output_path: {
        type: "string",
        description: "Destination path for the output .docx file.",
      },
      changes: {
        type: "array",
        description:
          "Ordered list of document edits (insert_heading, insert_paragraph, " +
          "find_replace, apply_style, insert_table, set_footer, etc.).",
        items: { type: "object" },
      },
      officeContext: {
        type: "object",
        description:
          "Active Word context from the Office.js add-in " +
          "(selection, activeDocument, cursor position, etc.).",
      },
    },
  },

  async execute(
    params: WordSkillParams,
    ctx?: AgentSkillContext,
  ): Promise<AgentSkillResult> {
    const start = Date.now();
    try {
      const data = await WordSkillInvoker.invokeWordExpert(
        params.input_path ?? "",
        params.output_path,
        params.changes,
      );
      return {
        ok: true,
        data,
        meta: {
          durationMs: Date.now() - start,
          skillName: "word_expert",
          traceId: ctx?.traceId,
        },
      };
    } catch (err) {
      return {
        ok: false,
        error: err instanceof Error ? err.message : String(err),
        meta: { skillName: "word_expert", traceId: ctx?.traceId },
      };
    }
  },
};
