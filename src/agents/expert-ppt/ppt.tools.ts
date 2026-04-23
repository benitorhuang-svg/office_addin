/**
 * PPTSkill — Agent-callable wrapper for the PPTExpert domain.
 */
import { PPTSkillInvoker } from "@agents/expert-ppt/domain/ppt-invoker.js";
import type {
  AgentSkill,
  AgentSkillContext,
  AgentSkillResult,
} from "@agents/agent-skill.js";

// ── Param contract ────────────────────────────────────────────────────────

export interface PPTSkillParams extends Record<string, unknown> {
  /** Path to the source PPTX file (omit to create a new presentation). */
  input_path?: string;
  /** Destination path for the output .pptx file. */
  output_path: string;
  /**
   * Ordered list of slide edits, e.g.:
   *   { op: "add_slide", layout: "Title and Content", title: "Overview" }
   *   { op: "insert_text", slide: 1, shape: "Title 1", text: "Q1 Results" }
   *   { op: "insert_image", slide: 2, path: "./charts/revenue.png" }
   */
  changes: Array<Record<string, unknown>>;
  /** Active presentation context from the Office.js add-in (optional). */
  officeContext?: Record<string, unknown>;
}

// ── Skill definition ──────────────────────────────────────────────────────

export const pptSkill: AgentSkill<PPTSkillParams> = {
  name: "ppt_expert",
  version: "3.0",
  description:
    "Presentation automation via the PPTExpert engine: create decks, " +
    "add slides, insert text/images/shapes, and apply themes. " +
    "Invoke when the user asks about PowerPoint, presentations, " +
    "slides, decks, or visual storytelling.",

  trigger: "High-fidelity slide layout and UI/UX logic.",
  logic: "Use when user refers to slides, presentations, decks, visual layouts, or PowerPoint design.",
  intent_labels: ["ppt", "slide", "presentation", "deck", "visual_design"],
  example_inputs: [
    "Add a title slide with the company logo on the right",
    "Create a 3-column comparison layout for slide 4",
    "Generate a timeline slide showing Q1–Q4 milestones",
    "Apply the Industrial Zenith theme to all slides",
    "Add speaker notes summarising the key points on slide 2"
  ],
  example_outputs: "Returns Office.js code to manipulate the active presentation + design rationale.",
  edge_cases: "If slide index is not specified, target the currently selected slide. If no presentation is open, ask the user to open one.",
  parallel_safe: true,

  parameters: {
    type: "object",
    required: ["output_path", "changes"],
    properties: {
      input_path: {
        type: "string",
        description:
          "Source PPTX file path. Omit to create a new presentation.",
      },
      output_path: {
        type: "string",
        description: "Destination path for the output .pptx file.",
      },
      changes: {
        type: "array",
        description:
          "Ordered list of presentation edits (add_slide, insert_text, " +
          "insert_image, apply_theme, set_background, etc.).",
        items: { type: "object" },
      },
      officeContext: {
        type: "object",
        description:
          "Active PowerPoint context from the Office.js add-in " +
          "(selectedSlide, presentationState, etc.).",
      },
    },
  },

  async execute(
    params: PPTSkillParams,
    ctx?: AgentSkillContext,
  ): Promise<AgentSkillResult> {
    const start = Date.now();
    try {
      const data = await PPTSkillInvoker.invokePPTExpert(
        params.input_path ?? "",
        params.output_path,
        params.changes,
      );
      return {
        ok: true,
        data,
        meta: {
          durationMs: Date.now() - start,
          skillName: "ppt_expert",
          traceId: ctx?.traceId,
        },
      };
    } catch (err) {
      return {
        ok: false,
        error: err instanceof Error ? err.message : String(err),
        meta: { skillName: "ppt_expert", traceId: ctx?.traceId },
      };
    }
  },
};
