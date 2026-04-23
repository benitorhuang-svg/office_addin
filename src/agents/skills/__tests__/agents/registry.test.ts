/**
 * Unit tests: Agent Skill Registry
 */

jest.mock("@agents/expert-excel/index.js", () => ({
  excelSkill: { name: "excel_expert", version: "3.0", description: "Excel", parameters: { type: "object", required: ["output_path", "changes"] } },
  ExcelSkillInvoker: { invokeExcelExpert: jest.fn() },
}));
jest.mock("@agents/expert-ppt/index.js", () => ({
  pptSkill: { name: "ppt_expert", version: "3.0", description: "PPT", parameters: { type: "object", required: ["output_path", "changes"] } },
  PPTSkillInvoker: { invokePPTExpert: jest.fn() },
}));
jest.mock("@agents/expert-word/index.js", () => ({
  wordSkill: { name: "word_expert", version: "3.0", description: "Word", parameters: { type: "object", required: ["output_path", "changes"] } },
  WordSkillInvoker: { invokeWordExpert: jest.fn() },
}));

import {
  getAllSkills,
  findSkill,
  registerSkill,
  getToolDefinitions,
} from "@agents/index.js";
import type { AgentSkill, ToolDefinition } from "@agents/index.js";

describe("Agent Skill Registry", () => {
  it("registers built-in skills", () => {
    const skills = getAllSkills();
    expect(skills.length).toBeGreaterThanOrEqual(3);
  });

  it("registers excel_expert", () => {
    expect(findSkill("excel_expert")).toBeDefined();
  });

  it("registers ppt_expert", () => {
    expect(findSkill("ppt_expert")).toBeDefined();
  });

  it("registers word_expert", () => {
    expect(findSkill("word_expert")).toBeDefined();
  });

  it("accepts custom skill registration at runtime", () => {
    const customSkill: AgentSkill = {
      name: "custom_test_skill",
      version: "1.0",
      description: "Test-only skill",
      parameters: { type: "object", properties: {}, required: [] },
      execute: jest.fn().mockResolvedValue({ ok: true }),
    };

    registerSkill(customSkill);

    expect(findSkill("custom_test_skill")).toBe(customSkill);
  });

  it("getToolDefinitions returns OpenAI-compatible function array", () => {
    const tools = getToolDefinitions();

    expect(Array.isArray(tools)).toBe(true);
    tools.forEach((tool: ToolDefinition) => {
      expect(tool.type).toBe("function");
      expect(typeof tool.function.name).toBe("string");
      expect(tool.function.parameters.type).toBe("object");
    });
  });

  it("tool names match skill names", () => {
    const tools = getToolDefinitions();
    const toolNames = tools.map((t: ToolDefinition) => t.function.name);

    expect(toolNames).toContain("excel_expert");
    expect(toolNames).toContain("ppt_expert");
    expect(toolNames).toContain("word_expert");
  });
});
