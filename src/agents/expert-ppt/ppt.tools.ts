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
      throw new Error(`Grid out of bounds: grid=[${gx},${gy}] span=[${sw_grid},${sh_grid}]. Must be within 12x12.`);
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
  output_path: string;
  changes: PPTAction[];
  officeContext?: PPTOfficeContext;
}

export const pptSkill: AgentSkill<PPTSkillParams> = {
  name: "ppt_master",
  version: "4.0 (Grid-Validated)",
  description: "High-precision presentation automation using virtual grid and theme matching.",
  parameters: {
    type: "object",
    required: ["output_path", "changes"],
    properties: {
      output_path: { type: "string", description: "Path to output" },
      changes: { type: "array", description: "List of changes", items: { type: "object" } },
      officeContext: { type: "object", description: "Context" }
    }
  },
  
  execute: createSkillExecutor<PPTSkillParams>("ppt_master", async (params) => {
    // P1: Coordinate Transformation
    const sw = params.officeContext?.slideWidthPts;
    const sh = params.officeContext?.slideHeightPts;

    const processedChanges = params.changes.map(ch => {
      if (ch.position) {
        const pts = PPTGridSystem.toPoints(ch.position, sw, sh);
        return { ...ch, ...pts };
      }
      return ch;
    });

    return await PPTExpertInvoker.invokePPTExpert(
      "",
      params.output_path,
      processedChanges,
      params.officeContext
    );
  })
};
