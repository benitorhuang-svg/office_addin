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
  sourceFormat?: "docx";
  preserveTemplate?: boolean;
  templateConventions?: string[];
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
  input_path?: string;
  output_path: string;
  changes: WordAction[];
  officeContext?: WordOfficeContext;
}

export const wordSkill: AgentSkill<WordSkillParams> = {
  name: "word_expert",
  version: "5.1.0",
  description:
    "Workflow-first docx automation for structured drafting, template-preserving editing, semantic styling, and controlled document assembly.",
  trigger:
    "Word or .docx requests that depend on document structure, semantic styles, existing template preservation, or controlled editorial changes.",
  logic:
    "Map document structure first, preserve the existing document when input_path is present, then draft or revise with audience-aware language and emit only docx-safe edits.",
  intent_labels: ["word", "document", "writing", "style"],
  examples: [
    {
      input: {
        input_path: "Quarterly_Template.docx",
        output_path: "Executive_Summary.docx",
        changes: [
          { op: "insert_heading", text: "Q1 Strategic Overview", level: 1 },
          {
            op: "insert_paragraph",
            text: "This report outlines the primary growth drivers and cost-saving measures.",
            style: "Body",
          },
        ],
      },
      output: { ok: true },
      reasoning: "Establishes a clear semantic hierarchy and applies professional phrasing.",
    },
    {
      input: {
        input_path: "system_arch_template.docx",
        output_path: "system_arch.docx",
        changes: [
          { op: "find_replace", find: "Legacy DB", replace: "Modern Data Warehouse" },
          { op: "add_image", image_path: "assets/diagram.png", width_in: 6.5 },
        ],
      },
      output: { ok: true },
      reasoning: "Ensures terminology accuracy and includes visual technical documentation.",
    },
  ],
  parallel_safe: true,
  edge_cases:
    "Semantic integrity requires using styles ('Heading 1') instead of manual formatting. Protected ranges, glossary overrides, and document outline constraints must be respected.",
  workflow: {
    overview:
      "Treat Word work as structured editing, not raw text generation. Preserve semantic hierarchy, use document-native styles, and keep revisions aligned with outline and glossary constraints.",
    whenToUse: [
      "The task involves drafting, rewriting, section planning, formatting, or assembling a Word document.",
      "The user references a .docx file path or wants the deliverable as a Word document.",
      "The document already has headings, protected ranges, or named styles that the output must respect.",
      "The user expects insertion or rewrite instructions that can be executed as Word actions.",
    ],
    process: [
      "Inspect document outline, available styles, protected ranges, and terminology constraints before editing.",
      "Preserve the existing document template when input_path is provided instead of rebuilding the file from scratch.",
      "Plan the target structure and draft content that fits the reader, section purpose, and existing hierarchy.",
      "Emit semantic Word actions that preserve styles, avoid protected content, and keep formatting changes intentional.",
    ],
    rationalizations: [
      {
        excuse: "It is faster to bold some text than to work through the document style system.",
        reality:
          "Appearance-only edits destroy semantic structure and make later automation unreliable. Use named styles and legal heading levels.",
      },
      {
        excuse:
          "The protected range is probably fine to overwrite because the user wants the section updated.",
        reality:
          "Protected content is an explicit boundary. Do not cross it without a clear override signal from the user or runtime.",
      },
      {
        excuse: "Recreating the document is easier than preserving the existing template.",
        reality:
          "Throwing away the document template loses headers, styles, section settings, and layout conventions. Preserve the .docx when the user gave you one.",
      },
    ],
    redFlags: [
      "Replacing structure with manual bolding instead of semantic headings or style names.",
      "Editing protected ranges, skipping glossary enforcement, or collapsing heading hierarchy.",
      "Discarding an existing .docx template even though the task only asked for targeted edits.",
      "Returning unstructured prose when the user asked for document edits or section-aware revisions.",
    ],
    verification: [
      "Every heading level change is legal relative to the existing outline.",
      "Requested terminology updates respect the glossary and keep protected ranges untouched.",
      "If input_path is provided, the requested output keeps the document template, styles, and layout unless the user explicitly asked for a rebuild.",
      "Formatting instructions use named styles or explicit Word actions instead of vague visual advice.",
    ],
    references: [
      "Semantic heading hierarchy over appearance-only formatting.",
      "Return a .docx deliverable for document work; convert legacy .doc files before editing.",
      "Audience-first drafting with concise, section-aware prose.",
    ],
  },
  parameters: {
    type: "object",
    required: ["output_path", "changes"],
    properties: {
      input_path: {
        type: "string",
        description:
          "Optional path to an existing .docx template or source document to preserve and edit",
      },
      output_path: { type: "string", description: "Path to the output .docx file" },
      changes: {
        type: "array",
        description:
          "Array of atomic operations: insert_paragraph, insert_heading, find_replace, replace_section, apply_named_style, insert_table, add_image, add_page_break, get_metadata.",
        items: { type: "object" },
      },
      officeContext: { type: "object", description: "Context" },
    },
  },

  execute: createSkillExecutor<WordSkillParams>("word_expert", async (params) => {
    return await WordExpertInvoker.invokeWordExpert(
      params.input_path ?? "",
      params.output_path,
      params.changes,
      params.officeContext
    );
  }),
};
