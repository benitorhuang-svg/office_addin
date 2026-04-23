/**
 * ExcelSkill — Agent-callable wrapper for the ExcelExpert domain.
 */
import { ExcelSkillInvoker } from "@agents/expert-excel/domain/excel-invoker.js";
import type {
  AgentSkill,
  AgentSkillContext,
  AgentSkillResult,
} from "@agents/agent-skill.js";

// ── Param contract ────────────────────────────────────────────────────────

export interface ExcelSkillParams extends Record<string, unknown> {
  /** Path to the source Excel file (omit for new workbooks). */
  input_path?: string;
  /** Destination path where the output file is written. */
  output_path: string;
  /**
   * Ordered list of change operations, e.g.:
   *   { op: "set_value",   cell: "B2", value: 42 }
   *   { op: "add_formula", cell: "C2", formula: "=SUM(A2:B2)" }
   *   { op: "format_range", range: "A1:D1", bold: true }
   */
  changes: Array<Record<string, unknown>>;
  /** Active workbook context forwarded from the Office.js add-in (optional). */
  officeContext?: Record<string, unknown>;
}

// ── Skill definition ──────────────────────────────────────────────────────

export const excelSkill: AgentSkill<ExcelSkillParams> = {
  name: "excel_expert",
  version: "3.0",
  description:
    "Spreadsheet automation via the ExcelExpert engine: create workbooks, " +
    "apply formulas, format ranges, build pivot tables, and generate charts. " +
    "Invoke when the user asks about Excel, spreadsheets, data analysis, " +
    "numeric reporting, or chart generation.",

  trigger: "Industrial data manipulation and spreadsheet automation.",
  logic: "Use when query involves spreadsheets, formulas, data tables, pivot analysis, charts, or numeric reporting.",
  intent_labels: ["excel", "spreadsheet", "data_analysis", "chart", "formula"],
  example_inputs: [
    "Add a SUM formula to column D rows 2 through 50",
    "Create a pivot table from Sheet1 grouped by Category",
    "Format all headers in row 1 as bold with blue background",
    "Generate a bar chart comparing Q1 vs Q2 sales",
    "Apply conditional formatting to highlight values above 1000"
  ],
  example_outputs: "Returns Office.js JavaScript snippet + brief explanation of what was applied.",
  edge_cases: "If the sheet name or cell range is not provided, infer from the active selection in officeContext. If officeContext is empty, ask the user to specify the target range.",
  parallel_safe: true,

  parameters: {
    type: "object",
    required: ["output_path", "changes"],
    properties: {
      input_path: {
        type: "string",
        description:
          "Source Excel file path. Omit to create a new workbook.",
      },
      output_path: {
        type: "string",
        description: "Destination path for the output .xlsx file.",
      },
      changes: {
        type: "array",
        description:
          "Ordered list of change operations (set_value, add_formula, " +
          "format_range, add_chart, add_pivot_table, etc.).",
        items: { type: "object" },
      },
      officeContext: {
        type: "object",
        description:
          "Active Excel context from the Office.js add-in " +
          "(activeSheet, selectedRange, etc.).",
      },
    },
  },

  async execute(
    params: ExcelSkillParams,
    ctx?: AgentSkillContext,
  ): Promise<AgentSkillResult> {
    const start = Date.now();
    try {
      const data = await ExcelSkillInvoker.invokeExcelExpert(
        params.input_path ?? "",
        params.output_path,
        params.changes,
      );
      return {
        ok: true,
        data,
        meta: {
          durationMs: Date.now() - start,
          skillName: "excel_expert",
          traceId: ctx?.traceId,
        },
      };
    } catch (err) {
      return {
        ok: false,
        error: err instanceof Error ? err.message : String(err),
        meta: { skillName: "excel_expert", traceId: ctx?.traceId },
      };
    }
  },
};
