/**
 * PPTSkill — Agent-callable wrapper for the PPT-Master domain.
 *
 * Capabilities:
 *  - Create / redesign PowerPoint presentations via the FastAPI skill bridge
 *  - Apply the 20-Design-Master philosophy library
 *  - Returns Office.js-compatible JSON for client-side execution
 */
import { PPTSkillInvoker } from "../parts/ppt/index.js";
import type {
  AgentSkill,
  AgentSkillContext,
  AgentSkillResult,
} from "./agent-skill.js";

// ── Param contract ────────────────────────────────────────────────────────

export interface PPTSkillParams extends Record<string, unknown> {
  /** Path to the source PPTX file (omit to create a new deck). */
  input_path?: string;
  /** Destination path for the output .pptx file. */
  output_path: string;
  /**
   * Ordered list of slide operations, e.g.:
   *   { op: "add_slide",   layout: "title_content", title: "Q1 Results" }
   *   { op: "set_text",    slide: 2, placeholder: "body", text: "…" }
   *   { op: "apply_theme", theme: "industrial_zenith" }
   */
  slides: Array<Record<string, unknown>>;
  /** Target slide index (0-based). Omit to act on the active slide. */
  slideIndex?: number;
  /** Active presentation context from the Office.js add-in (optional). */
  officeContext?: Record<string, unknown>;
}

// ── Skill definition ──────────────────────────────────────────────────────

export const pptSkill: AgentSkill<PPTSkillParams> = {
  name: "ppt_master",
  version: "3.0",
  description:
    "Slide design and presentation automation via the PPT-Master engine: " +
    "create decks, add slides, apply themes from the 20-Design-Master library, " +
    "set text/images, and add speaker notes. " +
    "Invoke when the user asks about PowerPoint, presentations, slides, " +
    "decks, visual layouts, or slide design.",

  parameters: {
    type: "object",
    required: ["output_path", "slides"],
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
      slides: {
        type: "array",
        description:
          "Ordered list of slide operations (add_slide, set_text, " +
          "apply_theme, add_image, add_chart, set_speaker_notes, etc.).",
        items: { type: "object" },
      },
      slideIndex: {
        type: "number",
        description:
          "Target slide index (0-based). Defaults to the currently selected slide.",
      },
      officeContext: {
        type: "object",
        description:
          "Active PowerPoint context from the Office.js add-in " +
          "(activeSlide, selectedShape, etc.).",
      },
    },
  },

  async execute(
    params: PPTSkillParams,
    ctx?: AgentSkillContext,
  ): Promise<AgentSkillResult> {
    const start = Date.now();
    try {
      const data = await PPTSkillInvoker.invokePPTMaster(
        params.input_path ?? "",
        params.output_path,
        params.slides,
      );
      return {
        ok: true,
        data,
        meta: {
          durationMs: Date.now() - start,
          skillName: "ppt_master",
          traceId: ctx?.traceId,
        },
      };
    } catch (err) {
      return {
        ok: false,
        error: err instanceof Error ? err.message : String(err),
        meta: { skillName: "ppt_master", traceId: ctx?.traceId },
      };
    }
  },
};
