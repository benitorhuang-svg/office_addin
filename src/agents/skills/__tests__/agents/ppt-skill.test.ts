import { PPTSkillInvoker } from "@agents/expert-ppt/domain/ppt-invoker.js";

jest.mock("@agents/expert-ppt/domain/ppt-invoker.js", () => ({
  PPTSkillInvoker: {
    invokePPTExpert: jest.fn(),
    getPromptPath: jest.fn(() => "/mock/path/ppt-master.md"),
  },
}));

import { pptSkill } from "@agents/expert-ppt/index.js";

describe("PPTSkill", () => {
  const mockInvoke = PPTSkillInvoker.invokePPTExpert as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should have correct metadata", () => {
    expect(pptSkill.name).toBe("ppt_expert");
    expect(pptSkill.version).toBe("3.0");
    expect(pptSkill.parameters.type).toBe("object");
  });

  it("should execute successfully", async () => {
    mockInvoke.mockResolvedValue({ status: "success", file: "/tmp/deck.pptx" });

    const result = await pptSkill.execute({
      output_path: "/tmp/deck.pptx",
      changes: [{ op: "add_slide", layout: "title_content", title: "Intro" }],
    });

    expect(result.ok).toBe(true);
    expect(result.data).toEqual({ status: "success", file: "/tmp/deck.pptx" });
    expect(mockInvoke).toHaveBeenCalledWith("", "/tmp/deck.pptx", [
      { op: "add_slide", layout: "title_content", title: "Intro" },
    ]);
  });

  it("should pass input_path when provided", async () => {
    mockInvoke.mockResolvedValue({ status: "success" });

    const changes = [{ op: "apply_theme", theme: "Dark" }];
    await pptSkill.execute({
      input_path: "/data/template.pptx",
      output_path: "/tmp/themed.pptx",
      changes,
    });

    expect(mockInvoke).toHaveBeenCalledWith("/data/template.pptx", "/tmp/themed.pptx", changes);
  });

  it("should handle empty changes gracefully", async () => {
    mockInvoke.mockResolvedValue({ status: "empty" });

    await pptSkill.execute({ output_path: "/tmp/new.pptx", changes: [] });

    expect(mockInvoke).toHaveBeenCalledWith("", "/tmp/new.pptx", []);
  });

  it("should catch and return errors", async () => {
    mockInvoke.mockRejectedValue(new Error("PPT Engine Crash"));

    const result = await pptSkill.execute({
      output_path: "/tmp/fail.pptx",
      changes: [],
    });

    expect(result.ok).toBe(false);
    expect(result.error).toBe("PPT Engine Crash");
  });

  it("should include telemetry metadata in results", async () => {
    mockInvoke.mockResolvedValue({});

    const ctx = { traceId: "ppt-123" };
    const result = await pptSkill.execute({ output_path: "/tmp/t.pptx", changes: [] }, ctx);

    expect(result.meta?.skillName).toBe("ppt_expert");
    expect(result.meta?.traceId).toBe("ppt-123");
    expect(typeof result.meta?.durationMs).toBe("number");
  });

  it("should work without optional context", async () => {
    mockInvoke.mockResolvedValue({});
    const result = await Promise.all([
      pptSkill.execute({ output_path: "/tmp/no-ctx.pptx", changes: [] }),
      pptSkill.execute({ output_path: "/tmp/no-ctx2.pptx", changes: [] }, undefined),
    ]);
    expect(result[0].ok).toBe(true);
    expect(result[1].ok).toBe(true);
  });
});
