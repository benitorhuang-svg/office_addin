import type { Tool } from "@github/copilot-sdk";
import type { OfficeContext } from "@shared/atoms/ai-core/types.js";
import { WordSkillInvoker } from "@agents/expert-word/index.js";
import { createOfficeSkillTool, type OfficeSkillArgs } from "@tools/office-atoms/shared/office-skill-tool.js";

export function createWordSkillTool(sessionOfficeContext?: OfficeContext): Tool<OfficeSkillArgs> {
  return createOfficeSkillTool(
    {
      name: "word_skill",
      description: "Provide the project Word expert skill so the agent can draft, rewrite, and structure document output for Word.",
      domain: "word",
      skillName: "WordExpert",
      category: "word_creative",
      recommendedHost: "Word",
      promptPath: WordSkillInvoker.getPromptPath(),
      usageHints: [
        "Use for reports, memos, executive summaries, rewriting, and document formatting.",
        "Pass updated selectionText when the active paragraph changed after the request started.",
        "Combine with officeContext to keep tone and structure aligned with the current document.",
      ],
    },
    sessionOfficeContext,
  );
}

