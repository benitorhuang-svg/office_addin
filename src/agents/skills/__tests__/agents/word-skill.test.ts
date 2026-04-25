/**
 * Unit tests: WordSkill agent interface
 */

import { WordExpertInvoker } from "@agents/expert-word/domain/word-invoker";

jest.mock("@agents/expert-word/domain/word-invoker", () => ({
  WordExpertInvoker: {
    invokeWordExpert: jest.fn(),
    getPromptPath: jest.fn().mockReturnValue("/fake/word-expert.md"),
  },
}));

import { wordSkill } from "@agents/expert-word/index";

const mockInvoke = WordExpertInvoker.invokeWordExpert as jest.Mock;

describe("WordSkill (agent interface)", () => {
  beforeEach(() => jest.clearAllMocks());

  it("has correct name and version", () => {
    expect(wordSkill.name).toBe("word_expert");
    expect(wordSkill.version).toBe("5.1.0");
  });

  it("describes when to invoke the skill", () => {
    expect(wordSkill.description.toLowerCase()).toMatch(/word|document|report|style/);
    expect(wordSkill.workflow.redFlags.length).toBeGreaterThan(0);
    expect(wordSkill.workflow.rationalizations.length).toBeGreaterThan(0);
  });

  it("declares required parameters in JSON-Schema format", () => {
    const { parameters } = wordSkill;
    expect(parameters.type).toBe("object");
    expect(parameters.required).toContain("output_path");
    expect(parameters.required).toContain("changes");
    expect(parameters.properties).toHaveProperty("input_path");
    expect(parameters.properties).toHaveProperty("output_path");
    expect(parameters.properties).toHaveProperty("changes");
    expect(parameters.properties).toHaveProperty("officeContext");
  });

  it("returns ok:true with data and meta on success", async () => {
    mockInvoke.mockResolvedValue({ status: "success", file: "/tmp/doc.docx" });

    const result = await wordSkill.execute({
      output_path: "/tmp/doc.docx",
      changes: [{ type: "INSERT_PARAGRAPH", text: "Executive Summary", styleName: "Heading 1" }],
    });

    expect(result.ok).toBe(true);
    expect(result.data).toMatchObject({ status: "success" });
    expect(result.meta?.skillName).toBe("word_expert");
    expect(typeof result.meta?.durationMs).toBe("number");
  });

  it("passes parameters correctly to invoker", async () => {
    mockInvoke.mockResolvedValue({});
    const changes: import("@shared/domain-actions").WordAction[] = [
      { type: "REPLACE_SECTION", sectionId: "{{DATE}}", text: "2026-04-23" },
    ];
    const officeContext = { availableNamedStyles: ["Normal", "Body"], documentOutline: [] };

    await wordSkill.execute({
      input_path: "/data/template.docx",
      output_path: "/data/report.docx",
      changes,
      officeContext,
    });

    expect(mockInvoke).toHaveBeenCalledWith(
      "/data/template.docx",
      "/data/report.docx",
      changes,
      officeContext
    );
  });

  it("defaults input_path to empty string when omitted", async () => {
    mockInvoke.mockResolvedValue({});

    await wordSkill.execute({ output_path: "/tmp/new.docx", changes: [] });

    expect(mockInvoke).toHaveBeenCalledWith("", "/tmp/new.docx", [], undefined);
  });

  it("returns ok:false with error message on bridge failure", async () => {
    mockInvoke.mockRejectedValue(new Error("docx output_path not writable"));

    const result = await wordSkill.execute({
      output_path: "/readonly/fail.docx",
      changes: [],
    });

    expect(result.ok).toBe(false);
    expect(result.error).toContain("not writable");
    expect(result.data).toBeUndefined();
  });

  it("forwards traceId in result meta", async () => {
    mockInvoke.mockResolvedValue({});

    const result = await wordSkill.execute(
      { output_path: "/tmp/trace.docx", changes: [] },
      { traceId: "trace-word-42" }
    );

    expect(result.meta?.traceId).toBe("trace-word-42");
  });
});
