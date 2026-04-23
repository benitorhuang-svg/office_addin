/**
 * Unit tests: ExcelSkill agent interface
 *
 * Validates the skill contract:
 *  - metadata (name, version, parameter schema)
 *  - ok:true path with data + meta
 *  - ok:false path on bridge error
 *  - traceId forwarding
 *  - input_path defaults to empty string when omitted
 */

jest.mock("../../parts/excel/index.js", () => ({
  ExcelSkillInvoker: {
    invokeExcelExpert: jest.fn(),
    getPromptPath: jest.fn().mockReturnValue("/fake/excel-expert.md"),
  },
}));

import { excelSkill } from "../../agents/excel-skill.js";
import { ExcelSkillInvoker } from "../../parts/excel/index.js";

const mockInvoke = ExcelSkillInvoker.invokeExcelExpert as jest.Mock;

describe("ExcelSkill (agent interface)", () => {
  beforeEach(() => jest.clearAllMocks());

  // ── Metadata ────────────────────────────────────────────────────────────

  it("has correct name and version", () => {
    expect(excelSkill.name).toBe("excel_expert");
    expect(excelSkill.version).toBe("3.0");
  });

  it("describes when to invoke the skill", () => {
    expect(excelSkill.description.toLowerCase()).toMatch(/excel|spreadsheet/);
  });

  it("declares required parameters in JSON-Schema format", () => {
    const { parameters } = excelSkill;
    expect(parameters.type).toBe("object");
    expect(parameters.required).toContain("output_path");
    expect(parameters.required).toContain("changes");
    expect(parameters.properties).toHaveProperty("input_path");
    expect(parameters.properties).toHaveProperty("output_path");
    expect(parameters.properties).toHaveProperty("changes");
  });

  // ── Happy path ──────────────────────────────────────────────────────────

  it("returns ok:true with data and meta on success", async () => {
    mockInvoke.mockResolvedValue({ status: "success", file: "/tmp/out.xlsx" });

    const result = await excelSkill.execute({
      output_path: "/tmp/out.xlsx",
      changes: [{ op: "set_value", cell: "A1", value: "Hello" }],
    });

    expect(result.ok).toBe(true);
    expect(result.data).toMatchObject({ status: "success" });
    expect(result.meta?.skillName).toBe("excel_expert");
    expect(typeof result.meta?.durationMs).toBe("number");
  });

  it("passes input_path and output_path correctly to invoker", async () => {
    mockInvoke.mockResolvedValue({});

    await excelSkill.execute({
      input_path: "/data/source.xlsx",
      output_path: "/data/output.xlsx",
      changes: [],
    });

    expect(mockInvoke).toHaveBeenCalledWith(
      "/data/source.xlsx",
      "/data/output.xlsx",
      [],
    );
  });

  it("defaults input_path to empty string when omitted", async () => {
    mockInvoke.mockResolvedValue({});

    await excelSkill.execute({ output_path: "/tmp/x.xlsx", changes: [] });

    expect(mockInvoke).toHaveBeenCalledWith("", "/tmp/x.xlsx", []);
  });

  // ── Error path ──────────────────────────────────────────────────────────

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

  it("stringifies non-Error throws", async () => {
    mockInvoke.mockRejectedValue("string error");

    const result = await excelSkill.execute({
      output_path: "/tmp/fail.xlsx",
      changes: [],
    });

    expect(result.ok).toBe(false);
    expect(typeof result.error).toBe("string");
  });

  // ── Context propagation ─────────────────────────────────────────────────

  it("forwards traceId in result meta", async () => {
    mockInvoke.mockResolvedValue({ done: true });

    const result = await excelSkill.execute(
      { output_path: "/tmp/trace.xlsx", changes: [] },
      { traceId: "trace-excel-001" },
    );

    expect(result.meta?.traceId).toBe("trace-excel-001");
  });

  it("works without context (context is optional)", async () => {
    mockInvoke.mockResolvedValue({});

    await expect(
      excelSkill.execute({ output_path: "/tmp/no-ctx.xlsx", changes: [] }),
    ).resolves.toMatchObject({ ok: true });
  });
});
