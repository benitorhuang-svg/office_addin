import { createSkillExecutor } from "@agents/shared/skill-executor-factory.js";
import { PPTExpertInvoker } from "./domain/ppt-invoker";
import type { AgentSkill } from "@agents/agent-skill.js";
import type { PPTGridPosition, PPTAction } from "@shared/domain-actions.js";

/**
 * PPT Virtual Grid System (P1 Optimized)
 * Standardizes 16:9 slide (720x405 pts) into a 12x12 logical grid.
 */
export class PPTGridSystem {
  private static readonly DEFAULT_SW = 720;
  private static readonly DEFAULT_SH = 405;

  public static toPoints(pos: PPTGridPosition, customWidth?: number, customHeight?: number) {
    const sw = customWidth ?? this.DEFAULT_SW;
    const sh = customHeight ?? this.DEFAULT_SH;
    const [gx, gy] = pos.grid;
    const [sw_grid, sh_grid] = pos.span;

    // P1: Grid boundary validation
    if (gx < 0 || gy < 0 || gx + sw_grid > 12 || gy + sh_grid > 12) {
      throw new Error(
        `Grid out of bounds: grid=[${gx},${gy}] span=[${sw_grid},${sh_grid}]. Must be within 12x12.`
      );
    }

    const ux = sw / 12;
    const uy = sh / 12;
    return {
      left: Math.round(gx * ux),
      top: Math.round(gy * uy),
      width: Math.round(sw_grid * ux),
      height: Math.round(sh_grid * uy),
    };
  }
}

export interface PPTOfficeContext {
  selectedSlide?: number;
  slideCount?: number;
  presentationTitle?: string;
  sourceFormat?: "pptx";
  preserveTemplate?: boolean;
  templateConventions?: string[];
  /** P2: Support for non-16:9 ratios */
  slideWidthPts?: number;
  slideHeightPts?: number;
  /** P2: Brand Theme Tokens exported from host */
  themeColors: {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
  };
}

export interface PPTSkillParams extends Record<string, unknown> {
  input_path?: string;
  output_path: string;
  changes: PPTAction[];
  officeContext?: PPTOfficeContext;
}

export const pptSkill: AgentSkill<PPTSkillParams> = {
  name: "ppt_expert",
  version: "5.1.0",
  description:
    "Workflow-first pptx automation for narrative deck design, template-preserving slide edits, grid-safe layout planning, and brand-consistent presentation updates.",
  trigger:
    "PowerPoint or .pptx requests that require slide narrative, visual hierarchy, existing template preservation, or layout-safe automation.",
  logic:
    "Outline the deck narrative first, preserve the existing presentation when input_path is present, then map content into the slide grid and apply brand/readability constraints before execution.",
  intent_labels: ["ppt", "presentation", "slide", "layout", "grid"],
  examples: [
    {
      input: {
        input_path: "Q1_Template.pptx",
        output_path: "Q1_Performance.pptx",
        changes: [
          {
            op: "add_title_slide",
            title: "2026 Q1 Business Review",
            subtitle: "Nexus Center Excellence",
          },
          {
            op: "add_slide",
            title: "Revenue Growth",
            body: "• Revenue grew by 15% YoY\n• Driven by enterprise segment",
            font_size_pt: 24,
          },
        ],
      },
      output: { ok: true },
      reasoning:
        "Establishes a professional narrative and applies standard bullet points with clear hierarchy.",
    },
    {
      input: {
        input_path: "dark_mode_template.pptx",
        output_path: "dark_mode.pptx",
        changes: [
          { op: "set_background_color", slide_index: 0, hex_color: "121212" },
          {
            op: "add_image",
            slide_index: 0,
            image_path: "assets/growth_chart.png",
            left_in: 5.0,
            top_in: 2.0,
            width_in: 4.5,
          },
        ],
      },
      output: { ok: true },
      reasoning:
        "Implements a high-contrast dark theme and precisely positions visual evidence on the slide.",
    },
  ],
  parallel_safe: true,
  edge_cases:
    "WCAG compliance requires font sizes >= 18pt. Complex animations are not yet supported via grid coordinates, and slide geometry must remain within the declared canvas.",
  workflow: {
    overview:
      "Treat PowerPoint work as narrative design with operational guardrails: decide what each slide must say, map it into a readable layout, and keep every design move inside brand and accessibility constraints.",
    whenToUse: [
      "The task involves slides, decks, speaker notes, presentation structure, or visual storytelling.",
      "The user references a .pptx file path or wants the deliverable as a presentation deck.",
      "The user needs placement, hierarchy, or theme decisions that depend on PowerPoint slide geometry.",
      "The answer should result in PowerPoint actions or deck-ready content, not just abstract advice.",
    ],
    process: [
      "Plan the audience journey and identify the minimum set of slides or edits needed to tell the story.",
      "Preserve the existing deck template when input_path is provided instead of recreating the presentation from scratch.",
      "Map titles, body content, charts, and media into the grid system so spacing and emphasis are intentional.",
      "Apply theme, typography, and readability rules before emitting PowerPoint actions for execution.",
    ],
    rationalizations: [
      {
        excuse: "I can fit everything on one slide if I just make the font smaller.",
        reality:
          "Unreadable slides are a failed result. Split the story across slides instead of violating readability constraints.",
      },
      {
        excuse: "The exact layout does not matter as long as the content is present.",
        reality:
          "For presentations, layout is part of the message. Grid discipline and hierarchy are part of correctness, not optional polish.",
      },
      {
        excuse: "Rebuilding the deck is simpler than preserving the template.",
        reality:
          "Existing decks carry master layouts, theme bindings, and speaker-note conventions. Preserve the .pptx when the user gave you one.",
      },
    ],
    redFlags: [
      "Crowding a slide with too many bullets, shapes, or visual accents without a narrative reason.",
      "Using font sizes below presentation-safe thresholds or ignoring theme color constraints from context.",
      "Discarding an existing .pptx template when the task only asked for targeted slide edits.",
      "Placing content outside the 12x12 grid or assuming unsupported animation capabilities.",
    ],
    verification: [
      "Each slide has a clear role in the narrative and no element exceeds the slide grid boundaries.",
      "Typography and color choices stay within readability and brand constraints.",
      "If input_path is provided, the requested output keeps the existing deck template and only changes the intended slides or elements.",
      "The emitted PowerPoint actions can be executed without relying on unsupported transitions or hidden assumptions.",
    ],
    references: [
      "Narrative-first decks beat slide-by-slide ornamentation.",
      "Return a .pptx deliverable for presentation work; convert legacy .ppt files before editing.",
      "Readable contrast and spacing are part of correctness, not optional polish.",
    ],
  },
  parameters: {
    type: "object",
    required: ["output_path", "changes"],
    properties: {
      input_path: {
        type: "string",
        description:
          "Optional path to an existing .pptx template or source deck to preserve and edit",
      },
      output_path: { type: "string", description: "Path to the output .pptx deck" },
      changes: {
        type: "array",
        description:
          "Array of atomic operations: add_slide, add_title_slide, add_shape, insert_text, set_font, add_image, set_background_color, set_slide_notes, get_metadata.",
        items: { type: "object" },
      },
      officeContext: { type: "object", description: "Context" },
    },
  },

  execute: createSkillExecutor<PPTSkillParams>("ppt_expert", async (params) => {
    // P1: Coordinate Transformation
    const sw = params.officeContext?.slideWidthPts;
    const sh = params.officeContext?.slideHeightPts;

    const processedChanges = params.changes.map((ch) => {
      if (ch.position) {
        const pts = PPTGridSystem.toPoints(ch.position, sw, sh);
        return { ...ch, ...pts };
      }
      return ch;
    });

    return await PPTExpertInvoker.invokePPTExpert(
      params.input_path ?? "",
      params.output_path,
      processedChanges,
      params.officeContext
    );
  }),
};
