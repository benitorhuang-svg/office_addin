import type { Tool } from "@github/copilot-sdk";
import type { OfficeContext } from "@shared/atoms/ai-core/types.js";
import { PPTSkillInvoker } from "@agents/expert-ppt/index.js";
import { createOfficeSkillTool, type OfficeSkillArgs } from "@tools/office-atoms/shared/office-skill-tool.js";

export function createPowerPointSkillTool(sessionOfficeContext?: OfficeContext): Tool<OfficeSkillArgs> {
  return createOfficeSkillTool(
    {
      name: "powerpoint_skill",
      description: "Provide the project PowerPoint expert skill so the agent can generate slide structures, layouts, and presentation-ready content.",
      domain: "powerpoint",
      skillName: "PPT-Master",
      category: "ppt_design",
      recommendedHost: "PowerPoint",
      promptPath: PPTSkillInvoker.getPromptPath(),
      usageHints: [
        "Use for slide outlines, deck narratives, title-body layouts, and presentation design moves.",
        "Pass selectionText when the current slide already contains source text or speaker notes.",
        "Use the returned prompt and context to stay aligned with the project's slide design persona.",
      ],
    },
    sessionOfficeContext,
  );
}

