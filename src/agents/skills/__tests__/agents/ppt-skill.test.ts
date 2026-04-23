import { PPTExpertInvoker } from "@agents/expert-ppt/domain/ppt-invoker";

jest.mock("@agents/expert-ppt/domain/ppt-invoker", () => ({
  PPTExpertInvoker: {
    invokePPTExpert: jest.fn(),
    getPromptPath: jest.fn(() => "/mock/path/ppt-master.md"),
  },
}));

import { pptSkill } from "@agents/expert-ppt/index";

describe("PPTSkill", () => {
  const mockInvoke = PPTExpertInvoker.invokePPTExpert as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should have correct metadata", () => {
    expect(pptSkill.name).toBe("ppt_master");
    expect(pptSkill.version).toBe("4.0 (Grid-Validated)");
    expect(pptSkill.parameters.type).toBe("object");
  });

  it("should execute successfully", async () => {
    mockInvoke.mockResolvedValue({ status: "success", file: "/tmp/deck.pptx" });

    const result = await pptSkill.execute({
      output_path: "/tmp/deck.pptx",
      changes: [{ type: "ADD_SHAPE", slideIndex: 1, content: "Intro" }],
    });

    expect(result.ok).toBe(true);
    expect(result.data).toEqual({ status: "success", file: "/tmp/deck.pptx" });
    expect(mockInvoke).toHaveBeenCalledWith("", "/tmp/deck.pptx", [
      { type: "ADD_SHAPE", slideIndex: 1, content: "Intro" },
    ], undefined);
  });

  it("should handle empty changes gracefully", async () => {
    mockInvoke.mockResolvedValue({ status: "empty" });

    await pptSkill.execute({ output_path: "/tmp/new.pptx", changes: [] });

    expect(mockInvoke).toHaveBeenCalledWith("", "/tmp/new.pptx", [], undefined);
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

    expect(result.meta?.skillName).toBe("ppt_master");
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
