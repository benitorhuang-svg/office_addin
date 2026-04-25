import { invokeExcelSkill } from "@infra/services/bridge-client.js";

jest.mock("@infra/services/bridge-client.js", () => ({
  invokeExcelSkill: jest.fn(),
}));

import {
  ExcelSkillInvoker,
  normalizeExcelChanges,
} from "@agents/expert-excel/domain/excel-invoker";

const mockInvokeExcelSkill = invokeExcelSkill as jest.MockedFunction<typeof invokeExcelSkill>;

describe("ExcelSkillInvoker", () => {
  beforeEach(() => jest.clearAllMocks());

  it("normalizes typed Excel actions for the bridge", () => {
    expect(
      normalizeExcelChanges([
        { type: "SET_FORMULA", range: "B2", value: "SUM(A2:A10)" },
        {
          type: "CREATE_PIVOT_TABLE",
          source: "Sales!A1:C10",
          destination: "Summary!A1",
          name: "SalesSummary",
          rows: ["Region"],
          columns: ["Year"],
          values: ["Amount"],
        },
      ])
    ).toEqual([
      { op: "add_formula", cell: "B2", formula: "=SUM(A2:A10)" },
      {
        op: "create_pivottable",
        source: "Sales!A1:C10",
        destination: "Summary!A1",
        name: "SalesSummary",
        rows: ["Region"],
        columns: ["Year"],
        values: [{ field: "Amount", func: "SUM" }],
      },
    ]);
  });

  it("passes normalized changes and office context through to the bridge", async () => {
    mockInvokeExcelSkill.mockResolvedValue({ status: "success" });

    await ExcelSkillInvoker.invokeExcelExpert(
      "/tmp/template.xlsx",
      "/tmp/output.xlsx",
      [{ action: "set_formula", range: "C5", value: "A5*B5" }],
      {
        activeSheet: "Forecast",
        preserveTemplate: true,
        tableSchemas: [],
      }
    );

    expect(mockInvokeExcelSkill).toHaveBeenCalledWith({
      input_path: "/tmp/template.xlsx",
      output_path: "/tmp/output.xlsx",
      changes: [{ op: "add_formula", cell: "C5", formula: "=A5*B5" }],
      office_context: {
        activeSheet: "Forecast",
        preserveTemplate: true,
        tableSchemas: [],
      },
    });
  });

  it("fails fast on unsupported bridge actions", () => {
    expect(() =>
      normalizeExcelChanges([{ type: "DEFINE_TABLE_SCHEMA", columns: ["Revenue"] }])
    ).toThrow(/not currently supported/i);
  });
});
