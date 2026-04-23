import type { Tool } from "@github/copilot-sdk";
import type { OfficeContext } from "@shared/atoms/ai-core/types.js";
import { createGoogleSearchTool } from "@tools/office-atoms/core/google-search-tool.js";
import { createPythonExecutorTool } from "@tools/office-atoms/core/python-executor-tool.js";
import { createExcelChartTool } from "@tools/office-atoms/office/create-excel-chart-tool.js";
import { createExcelSkillTool } from "@tools/office-atoms/office/excel-skill-tool.js";
import { createPowerPointSkillTool } from "@tools/office-atoms/office/powerpoint-skill-tool.js";
import { createWordSkillTool } from "@tools/office-atoms/office/word-skill-tool.js";

export {
  createExcelChartTool,
  createExcelSkillTool,
  createGoogleSearchTool,
  createPowerPointSkillTool,
  createPythonExecutorTool,
  createWordSkillTool,
};

export function getSessionTools(sessionOfficeContext?: OfficeContext): Tool<unknown>[] {
  return [
    createGoogleSearchTool() as Tool<unknown>,
    createPythonExecutorTool() as Tool<unknown>,
    createExcelChartTool() as Tool<unknown>,
    createWordSkillTool(sessionOfficeContext) as Tool<unknown>,
    createExcelSkillTool(sessionOfficeContext) as Tool<unknown>,
    createPowerPointSkillTool(sessionOfficeContext) as Tool<unknown>,
  ];
}

