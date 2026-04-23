import type { Tool } from "@github/copilot-sdk";
import type { OfficeContext } from "../../atoms/types.js";
import { ExcelSkillInvoker } from "../../../../skills/parts/excel/index.js";
import { createOfficeSkillTool, type OfficeSkillArgs } from "../shared/office-skill-tool.js";

export function createExcelSkillTool(sessionOfficeContext?: OfficeContext): Tool<OfficeSkillArgs> {
  return createOfficeSkillTool(
    {
      name: "excel_skill",
      description: "Provide the project Excel expert skill so the agent can reason about tables, formulas, pivots, and chart-ready analysis.",
      domain: "excel",
      skillName: "ExcelExpert",
      category: "excel_data",
      recommendedHost: "Excel",
      promptPath: ExcelSkillInvoker.getPromptPath(),
      usageHints: [
        "Use for spreadsheet transformations, formula planning, pivot logic, and analytical summaries.",
        "Pass selectionText with the active range values when you need cell-aware reasoning.",
        "Pair with create_excel_chart when the answer should also materialize as a chart.",
      ],
    },
    sessionOfficeContext,
  );
}

