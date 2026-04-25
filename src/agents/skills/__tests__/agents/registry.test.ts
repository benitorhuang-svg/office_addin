/**
 * Unit tests: Agent Skill Registry
 */

jest.mock("@agents/expert-excel/index.js", () => ({
  excelSkill: {
    name: "excel_expert",
    version: "5.1.0",
    description: "Excel workflow skill",
    parameters: { type: "object", required: ["output_path", "changes"], properties: {} },
    examples: [{ input: {}, output: {}, reasoning: "Valid example" }],
    parallel_safe: true,
    workflow: {
      overview: "Excel workflow",
      whenToUse: ["Use for Excel"],
      process: ["Inspect", "Validate", "Execute"],
      rationalizations: [{ excuse: "Skip checks", reality: "Do not skip checks" }],
      redFlags: ["No fake ranges"],
      verification: ["Check formulas"],
    },
  },
  ExcelSkillInvoker: { invokeExcelExpert: jest.fn() },
}));
jest.mock("@agents/expert-ppt/index.js", () => ({
  pptSkill: {
    name: "ppt_expert",
    version: "5.1.0",
    description: "PPT workflow skill",
    parameters: { type: "object", required: ["output_path", "changes"], properties: {} },
    examples: [{ input: {}, output: {}, reasoning: "Valid example" }],
    parallel_safe: true,
    workflow: {
      overview: "PPT workflow",
      whenToUse: ["Use for PPT"],
      process: ["Plan", "Layout", "Apply"],
      rationalizations: [{ excuse: "Cram content", reality: "Split slides instead" }],
      redFlags: ["No overflow"],
      verification: ["Check readability"],
    },
  },
  PPTSkillInvoker: { invokePPTExpert: jest.fn() },
}));
jest.mock("@agents/expert-word/index.js", () => ({
  wordSkill: {
    name: "word_expert",
    version: "5.1.0",
    description: "Word workflow skill",
    parameters: { type: "object", required: ["output_path", "changes"], properties: {} },
    examples: [{ input: {}, output: {}, reasoning: "Valid example" }],
    parallel_safe: true,
    workflow: {
      overview: "Word workflow",
      whenToUse: ["Use for Word"],
      process: ["Inspect", "Draft", "Emit"],
      rationalizations: [{ excuse: "Bold is enough", reality: "Use semantic styles" }],
      redFlags: ["No style drift"],
      verification: ["Check outline"],
    },
  },
  WordSkillInvoker: { invokeWordExpert: jest.fn() },
}));

import { getAllSkills, findSkill, registerSkill, getToolDefinitions } from "@agents/index.js";
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
      version: "1.0.0",
      description: "Test-only skill",
      examples: [{ input: {}, output: {}, reasoning: "Custom runtime registration" }],
      parallel_safe: true,
      parameters: { type: "object", properties: {}, required: [] },
      workflow: {
        overview: "Custom workflow",
        whenToUse: ["Use in registry tests"],
        process: ["Register the skill"],
        rationalizations: [
          { excuse: "Workflow metadata is optional", reality: "Workflow metadata is required" },
        ],
        redFlags: ["Missing workflow metadata"],
        verification: ["Skill can be looked up"],
      },
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
