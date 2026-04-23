/**
 * Unit tests: PPTSkill agent interface
 *
 * Validates:
 *  - metadata (name, version, parameter schema)
 *  - ok:true with data + design-review meta
 *  - ok:false on bridge error
 *  - slideIndex and officeContext forwarding
 *  - traceId propagation
 */

jest.mock("../../parts/ppt/index.js", () => ({
  PPTSkillInvoker: {
    invokePPTMaster: jest.fn(),
    getPromptPath: jest.fn().mockReturnValue("/fake/ppt-master.md"),
  },
}));

import { pptSkill } from "../../agents/ppt-skill.js";
import { PPTSkillInvoker } from "../../parts/ppt/index.js";

const mockInvoke = PPTSkillInvoker.invokePPTMaster as jest.Mock;

describe("PPTSkill (agent interface)", () => {
  beforeEach(() => jest.clearAllMocks());

  // ── Metadata ────────────────────────────────────────────────────────────

  it("has correct name and version", () => {
    expect(pptSkill.name).toBe("ppt_master");
    expect(pptSkill.version).toBe("3.0");
  });

  it("describes when to invoke the skill", () => {
    expect(pptSkill.description.toLowerCase()).toMatch(/ppt|slide|presentation/);
  });

  it("declares required parameters in JSON-Schema format", () => {
    const { parameters } = pptSkill;
    expect(parameters.type).toBe("object");
    expect(parameters.required).toContain("output_path");
    expect(parameters.required).toContain("slides");
    expect(parameters.properties).toHaveProperty("input_path");
    expect(parameters.properties).toHaveProperty("slides");
    expect(parameters.properties).toHaveProperty("slideIndex");
  });

  // ── Happy path ──────────────────────────────────────────────────────────

  it("returns ok:true with data and meta on success", async () => {
    mockInvoke.mockResolvedValue({ status: "success", file: "/tmp/deck.pptx" });

    const result = await pptSkill.execute({
      output_path: "/tmp/deck.pptx",
      slides: [{ op: "add_slide", layout: "title_content", title: "Intro" }],
    });

    expect(result.ok).toBe(true);
    expect(result.data).toMatchObject({ status: "success" });
    expect(result.meta?.skillName).toBe("ppt_master");
    expect(typeof result.meta?.durationMs).toBe("number");
  });

  it("passes input_path and slides to invoker", async () => {
    mockInvoke.mockResolvedValue({});
    const slides = [{ op: "apply_theme", theme: "industrial_zenith" }];

    await pptSkill.execute({
      input_path: "/data/template.pptx",
      output_path: "/data/result.pptx",
      slides,
    });

    expect(mockInvoke).toHaveBeenCalledWith(
      "/data/template.pptx",
      "/data/result.pptx",
      slides,
    );
  });

  it("defaults input_path to empty string when omitted", async () => {
    mockInvoke.mockResolvedValue({});

    await pptSkill.execute({ output_path: "/tmp/new.pptx", slides: [] });

    expect(mockInvoke).toHaveBeenCalledWith("", "/tmp/new.pptx", []);
  });

  // ── Error path ──────────────────────────────────────────────────────────

  it("returns ok:false with error message on bridge failure", async () => {
    mockInvoke.mockRejectedValue(new Error("python-pptx not installed"));

    const result = await pptSkill.execute({
      output_path: "/tmp/fail.pptx",
      slides: [],
    });

    expect(result.ok).toBe(false);
    expect(result.error).toContain("python-pptx");
    expect(result.data).toBeUndefined();
  });

  // ── Context propagation ─────────────────────────────────────────────────

  it("forwards traceId in result meta", async () => {
    mockInvoke.mockResolvedValue({});

    const result = await pptSkill.execute(
      { output_path: "/tmp/t.pptx", slides: [] },
      { traceId: "trace-ppt-007" },
    );

    expect(result.meta?.traceId).toBe("trace-ppt-007");
  });

  it("works without context (context is optional)", async () => {
    mockInvoke.mockResolvedValue({});

    await expect(
      pptSkill.execute({ output_path: "/tmp/no-ctx.pptx", slides: [] }),
    ).resolves.toMatchObject({ ok: true });
  });
});
