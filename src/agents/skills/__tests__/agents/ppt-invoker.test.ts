import { invokePPTSkill } from "@infra/services/bridge-client.js";

jest.mock("@infra/services/bridge-client.js", () => ({
  invokePPTSkill: jest.fn(),
}));

import { normalizePPTChanges, PPTExpertInvoker } from "@agents/expert-ppt/domain/ppt-invoker";

const mockInvokePPTSkill = invokePPTSkill as jest.MockedFunction<typeof invokePPTSkill>;

describe("PPTExpertInvoker", () => {
  beforeEach(() => jest.clearAllMocks());

  it("normalizes typed PPT actions for the bridge", () => {
    expect(
      normalizePPTChanges([
        {
          type: "ADD_SHAPE",
          slideIndex: 1,
          content: "Intro",
          left: 24,
          top: 36,
          width: 200,
          height: 80,
        },
        { action: "set_background_color", slide_index: 0, hex_color: "primary" },
      ])
    ).toEqual([
      {
        op: "add_shape",
        slide_index: 1,
        shape_type: "rectangle",
        text: "Intro",
        left: 24,
        top: 36,
        width: 200,
        height: 80,
        fill_color: undefined,
        font_size_pt: undefined,
        metadata: undefined,
      },
      {
        op: "set_background_color",
        slide_index: 0,
        hex_color: "primary",
        metadata: undefined,
      },
    ]);
  });

  it("passes normalized slides and office context through to the bridge", async () => {
    mockInvokePPTSkill.mockResolvedValue({ status: "success" });

    await PPTExpertInvoker.invokePPTExpert(
      "/tmp/template.pptx",
      "/tmp/output.pptx",
      [
        {
          action: "add_image",
          slide_index: 0,
          image_path: "chart.png",
          left: 10,
          top: 10,
          width: 100,
          height: 100,
        },
      ],
      { themeColors: { primary: "1E2761", secondary: "CADCFC", accent: "FFFFFF", text: "111111" } }
    );

    expect(mockInvokePPTSkill).toHaveBeenCalledWith({
      input_path: "/tmp/template.pptx",
      output_path: "/tmp/output.pptx",
      slides: [
        {
          op: "add_image",
          slide_index: 0,
          image_path: "chart.png",
          left_in: undefined,
          top_in: undefined,
          width_in: undefined,
          left: 10,
          top: 10,
          width: 100,
          height: 100,
          metadata: undefined,
        },
      ],
      office_context: {
        themeColors: { primary: "1E2761", secondary: "CADCFC", accent: "FFFFFF", text: "111111" },
      },
    });
  });

  it("fails fast on unsupported PPT bridge operations", () => {
    expect(() => normalizePPTChanges([{ type: "APPLY_LAYOUT", slideIndex: 0 }])).toThrow(
      /not currently supported/i
    );
  });
});
