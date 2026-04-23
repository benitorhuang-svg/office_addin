import type { Tool } from "@github/copilot-sdk";
import type { OfficeContext } from "../atoms/types.js";
import { createGoogleSearchTool } from "./core/google-search-tool.js";
import { createPythonExecutorTool } from "./core/python-executor-tool.js";
import { createExcelChartTool } from "./office/create-excel-chart-tool.js";
import { createExcelSkillTool } from "./office/excel-skill-tool.js";
import { createPowerPointSkillTool } from "./office/powerpoint-skill-tool.js";
import { createWordSkillTool } from "./office/word-skill-tool.js";

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

