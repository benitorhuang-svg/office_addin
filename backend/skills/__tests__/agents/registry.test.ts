/**
 * Unit tests: Agent Skill Registry
 *
 * Validates:
 *  - All 3 skills are registered
 *  - findSkill() looks up by name
 *  - getToolDefinitions() returns OpenAI-compatible format
 *  - registerSkill() adds custom skills at runtime
 *  - Each skill has a non-empty description and parameter schema
 */

// Mock the domain invokers so the skill modules don't try to resolve
// import.meta.url paths during test collection.
jest.mock("../../parts/excel/index.js", () => ({
  ExcelSkillInvoker: { invokeExcelExpert: jest.fn() },
}));
jest.mock("../../parts/ppt/index.js", () => ({
  PPTSkillInvoker: { invokePPTMaster: jest.fn() },
}));
jest.mock("../../parts/word/index.js", () => ({
  WordSkillInvoker: { invokeWordExpert: jest.fn() },
}));

import {
  getAllSkills,
  findSkill,
  registerSkill,
  getToolDefinitions,
} from "../../agents/index.js";
import type { AgentSkill, ToolDefinition } from "../../agents/index.js";

describe("Agent Skill Registry", () => {
  // ── Registration ─────────────────────────────────────────────────────────

  it("registers exactly 3 built-in skills", () => {
    expect(getAllSkills()).toHaveLength(3);
  });

  it("registers excel_expert", () => {
    expect(findSkill("excel_expert")).toBeDefined();
  });

  it("registers ppt_master", () => {
    expect(findSkill("ppt_master")).toBeDefined();
  });

  it("registers word_expert", () => {
    expect(findSkill("word_expert")).toBeDefined();
  });

  it("returns undefined for unknown skill names", () => {
    expect(findSkill("nonexistent_skill")).toBeUndefined();
    expect(findSkill("")).toBeUndefined();
  });

  // ── registerSkill() ──────────────────────────────────────────────────────

  it("accepts custom skill registration at runtime", () => {
    const customSkill: AgentSkill = {
      name: "custom_test_skill",
      version: "1.0",
      description: "Test-only skill",
      parameters: { type: "object", properties: {} },
      execute: jest.fn().mockResolvedValue({ ok: true }),
    };

    registerSkill(customSkill);

    expect(findSkill("custom_test_skill")).toBe(customSkill);
    expect(getAllSkills().length).toBeGreaterThanOrEqual(4);
  });

  // ── Tool definitions ─────────────────────────────────────────────────────

  it("getToolDefinitions returns OpenAI-compatible function array", () => {
    const tools = getToolDefinitions();

    expect(Array.isArray(tools)).toBe(true);
    tools.forEach((tool: ToolDefinition) => {
      expect(tool.type).toBe("function");
      expect(typeof tool.function.name).toBe("string");
      expect(tool.function.name.length).toBeGreaterThan(0);
      expect(typeof tool.function.description).toBe("string");
      expect(tool.function.description.length).toBeGreaterThan(0);
      expect(tool.function.parameters.type).toBe("object");
      expect(tool.function.parameters.properties).toBeDefined();
    });
  });

  it("tool names match skill names", () => {
    const tools = getToolDefinitions();
    const toolNames = tools.map((t: ToolDefinition) => t.function.name);

    expect(toolNames).toContain("excel_expert");
    expect(toolNames).toContain("ppt_master");
    expect(toolNames).toContain("word_expert");
  });

  // ── Schema validation ────────────────────────────────────────────────────

  it.each([
    ["excel_expert", ["output_path", "changes"]],
    ["ppt_master",   ["output_path", "slides"]],
    ["word_expert",  ["output_path", "changes"]],
  ])("%s declares required fields %p", (skillName, requiredFields) => {
    const skill = findSkill(skillName)!;
    expect(skill.parameters.required).toEqual(
      expect.arrayContaining(requiredFields),
    );
  });

  it.each(["excel_expert", "ppt_master", "word_expert"])(
    "%s has a version string",
    (skillName) => {
      const skill = findSkill(skillName)!;
      expect(typeof skill.version).toBe("string");
      expect(skill.version.length).toBeGreaterThan(0);
    },
  );
});
