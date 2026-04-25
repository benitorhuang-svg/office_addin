import { invokeWordSkill } from "@infra/services/bridge-client.js";

jest.mock("@infra/services/bridge-client.js", () => ({
  invokeWordSkill: jest.fn(),
}));

import { normalizeWordChanges, WordExpertInvoker } from "@agents/expert-word/domain/word-invoker";

const mockInvokeWordSkill = invokeWordSkill as jest.MockedFunction<typeof invokeWordSkill>;

describe("WordExpertInvoker", () => {
  beforeEach(() => jest.clearAllMocks());

  it("normalizes typed and legacy Word edits for the bridge", () => {
    expect(
      normalizeWordChanges([
        {
          type: "REPLACE_SECTION",
          sectionId: "{{DATE}}",
          text: "2026-04-25",
          styleName: "Body Text",
        },
        { action: "set_style", range: "p1", style: "Heading 1" },
      ])
    ).toEqual([
      { op: "replace_section", sectionId: "{{DATE}}", text: "2026-04-25", style: "Body Text" },
      { op: "apply_named_style", style: "Heading 1", range: "p1", target: undefined },
    ]);
  });

  it("passes normalized edits and office context to the bridge", async () => {
    mockInvokeWordSkill.mockResolvedValue({ status: "success" });

    await WordExpertInvoker.invokeWordExpert(
      "/tmp/template.docx",
      "/tmp/output.docx",
      [{ action: "insert_text", text: "Executive Summary", style: "Heading 1" }],
      { availableNamedStyles: ["Heading 1", "Normal"] }
    );

    expect(mockInvokeWordSkill).toHaveBeenCalledWith({
      input_path: "/tmp/template.docx",
      output_path: "/tmp/output.docx",
      edits: [{ op: "insert_paragraph", text: "Executive Summary", style: "Heading 1" }],
      office_context: { availableNamedStyles: ["Heading 1", "Normal"] },
    });
  });

  it("applies glossary corrections and preserves metadata for the bridge", async () => {
    mockInvokeWordSkill.mockResolvedValue({ status: "success" });

    await WordExpertInvoker.invokeWordExpert(
      "/tmp/template.docx",
      "/tmp/output.docx",
      [{ op: "insert_paragraph", text: "Legacy DB remains in scope.", style: "Normal" }],
      {
        availableNamedStyles: ["Normal"],
        glossary: { "Legacy DB": "Modern Data Warehouse" },
      }
    );

    expect(mockInvokeWordSkill).toHaveBeenCalledWith({
      input_path: "/tmp/template.docx",
      output_path: "/tmp/output.docx",
      edits: [
        {
          op: "insert_paragraph",
          text: "Modern Data Warehouse remains in scope.",
          style: "Normal",
          metadata: {
            glossaryCorrections: ["'Legacy DB' -> 'Modern Data Warehouse'"],
          },
        },
      ],
      office_context: {
        availableNamedStyles: ["Normal"],
        glossary: { "Legacy DB": "Modern Data Warehouse" },
      },
    });
  });

  it("corrects heading level jumps to maintain document hierarchy", async () => {
    mockInvokeWordSkill.mockResolvedValue({ status: "success" });

    await WordExpertInvoker.invokeWordExpert(
      "/tmp/template.docx",
      "/tmp/output.docx",
      [{ op: "insert_heading", text: "Deep Section", level: 5 }],
      {
        availableNamedStyles: ["Heading 1", "Heading 2"],
        documentOutline: [{ text: "Intro", level: 1, range: { start: 0, end: 10 } }], // Max level is 1, so next should be 2
      }
    );

    expect(mockInvokeWordSkill).toHaveBeenCalledWith(
      expect.objectContaining({
        edits: [
          expect.objectContaining({
            op: "insert_heading",
            level: 2,
          }),
        ],
      })
    );
  });

  it("rejects unsafe find_replace operations when protected ranges exist", async () => {
    await expect(
      WordExpertInvoker.invokeWordExpert(
        "/tmp/template.docx",
        "/tmp/output.docx",
        [{ op: "find_replace", find: "old", replace: "new" }],
        {
          availableNamedStyles: ["Normal"],
          protectedRanges: [{ start: 0, end: 20, label: "Locked intro" }],
        }
      )
    ).rejects.toThrow(/Global find_replace is disabled when protections are present/i);
  });

  it("fails fast on unsupported OOXML bridge operations", () => {
    expect(() => normalizeWordChanges([{ type: "INSERT_OOXML", ooxml: "<w:p/>" }])).toThrow(
      /not currently supported/i
    );
  });
});
