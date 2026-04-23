/**
 * Agent Registry
 */
import {
  excelSkill,
  ExcelSkillInvoker,
  getCoreInstructions as getExcelInstructions,
} from "./expert-excel/index";
import {
  wordSkill,
  WordSkillInvoker,
  getCoreInstructions as getWordInstructions,
} from "./expert-word/index";
import {
  pptSkill,
  PPTSkillInvoker,
  getCoreInstructions as getPPTInstructions,
} from "./expert-ppt/index";
import type { AgentSkill } from "./agent-skill";

const SKILLS_LIST: AgentSkill<Record<string, unknown>>[] = [
  excelSkill as AgentSkill<Record<string, unknown>>,
  wordSkill as AgentSkill<Record<string, unknown>>,
  pptSkill as AgentSkill<Record<string, unknown>>,
];

export function findSkill(name: string): AgentSkill<Record<string, unknown>> | undefined {
  return SKILLS_LIST.find((s) => s.name === name);
}

export function getAllSkills(): AgentSkill<Record<string, unknown>>[] {
  return SKILLS_LIST;
}

export function registerSkill(skill: AgentSkill<Record<string, unknown>>) {
  if (!findSkill(skill.name)) {
    SKILLS_LIST.push(skill);
  }
}

/** OpenAI-compatible tool definition format */
export interface ToolDefinition {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

export function getToolDefinitions(): ToolDefinition[] {
  return SKILLS_LIST.map((s) => ({
    type: "function",
    function: {
      name: s.name,
      description: s.description,
      parameters: s.parameters as unknown as Record<string, unknown>,
    },
  }));
}

export {
  excelSkill,
  wordSkill,
  pptSkill,
  ExcelSkillInvoker,
  WordSkillInvoker,
  PPTSkillInvoker,
  getExcelInstructions,
  getWordInstructions,
  getPPTInstructions,
};
export type { AgentSkill, AgentSkillContext, AgentSkillResult } from "./agent-skill.js";
