/**
 * Unit tests: ExcelSkill agent interface
 */

import { ExcelSkillInvoker } from "@agents/expert-excel/domain/excel-invoker";

jest.mock("@agents/expert-excel/domain/excel-invoker", () => ({
  ExcelSkillInvoker: {
    invokeExcelExpert: jest.fn(),
    getPromptPath: jest.fn().mockReturnValue("/fake/excel-expert.md"),
  },
}));

import { excelSkill } from "@agents/expert-excel/index";

const mockInvoke = ExcelSkillInvoker.invokeExcelExpert as jest.Mock;

describe("ExcelSkill (agent interface)", () => {
  beforeEach(() => jest.clearAllMocks());

  it("has correct name and version", () => {
    expect(excelSkill.name).toBe("excel_expert");
    expect(excelSkill.version).toBe("4.0 (Schema-First)");
  });

  it("describes when to invoke the skill", () => {
    expect(excelSkill.description.toLowerCase()).toMatch(/excel|spreadsheet/);
  });

  it("declares required parameters in JSON-Schema format", () => {
    const { parameters } = excelSkill;
    expect(parameters.type).toBe("object");
    expect(parameters.required).toContain("output_path");
    expect(parameters.required).toContain("changes");
    expect(parameters.properties).toHaveProperty("output_path");
    expect(parameters.properties).toHaveProperty("changes");
    expect(parameters.properties).toHaveProperty("officeContext");
  });

  it("returns ok:true with data and meta on success", async () => {
    mockInvoke.mockResolvedValue({ status: "success", file: "/tmp/out.xlsx" });

    const result = await excelSkill.execute({
      output_path: "/tmp/out.xlsx",
      changes: [{ type: "SET_VALUE", range: "A1", value: "Hello" }],
    });

    expect(result.ok).toBe(true);
    expect(result.data).toMatchObject({ status: "success" });
    expect(result.meta?.skillName).toBe("excel_expert");
    expect(typeof result.meta?.durationMs).toBe("number");
  });

  it("passes parameters correctly to invoker", async () => {
    mockInvoke.mockResolvedValue({});

    await excelSkill.execute({
      output_path: "/data/output.xlsx",
      changes: [],
    });

    expect(mockInvoke).toHaveBeenCalledWith("", "/data/output.xlsx", [], undefined);
  });

  it("returns ok:false with error message on bridge failure", async () => {
    mockInvoke.mockRejectedValue(new Error("Bridge timeout after 120s"));

    const result = await excelSkill.execute({
      output_path: "/tmp/fail.xlsx",
      changes: [],
    });

    expect(result.ok).toBe(false);
    expect(result.error).toContain("Bridge timeout");
    expect(result.data).toBeUndefined();
  });

  it("forwards traceId in result meta", async () => {
    mockInvoke.mockResolvedValue({ done: true });

    const result = await excelSkill.execute(
      { output_path: "/tmp/trace.xlsx", changes: [] },
      { traceId: "trace-excel-001" }
    );

    expect(result.meta?.traceId).toBe("trace-excel-001");
  });
});

