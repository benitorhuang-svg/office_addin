import { createSkillExecutor } from "@agents/shared/skill-executor-factory.js";
import { ExcelSkillInvoker } from "./domain/excel-invoker";
import type { AgentSkill } from "@agents/agent-skill.js";
import type { ExcelAction, ExcelTableSchema } from "@shared/domain-actions.js";

/**
 * Excel Expert Agent (E1/E2 Optimized)
 * Version 4.0 - Industrial Strength Data Engine
 */

export interface ExcelOfficeContext {
  activeSheet?: string;
  selectedRange?: string;
  workbookName?: string;
  sourceFormat?: "xlsx" | "xlsm" | "csv" | "tsv";
  preserveTemplate?: boolean;
  templateConventions?: string[];
  formulaPolicy?: "prefer-formulas" | "allow-literals-by-exception";
  /** E1: Logic structure over raw data */
  tableSchemas: ExcelTableSchema[];
  /** E1: Small preview for type inference */
  sampleRows?: Record<string, unknown>[];
  /** P3: Logical invariants that must hold true after changes (e.g., "Total Revenue = Sum of quarters") */
  logicalInvariants?: string[];
}

export interface ExcelSkillParams extends Record<string, unknown> {
  input_path?: string;
  output_path: string;
  changes: ExcelAction[];
  officeContext?: ExcelOfficeContext;
}

export const excelSkill: AgentSkill<ExcelSkillParams> = {
  name: "excel_expert",
  version: "5.1.0",
  description:
    "Workflow-first spreadsheet automation for xlsx/xlsm/csv/tsv deliverables, workbook-safe edits, formula-first modeling, and template-preserving reporting.",
  trigger:
    "Spreadsheet requests that require schema awareness, existing workbook preservation, formula correctness, pivot summarization, or file deliverables in xlsx/xlsm/csv/tsv.",
  logic:
    "Inspect workbook and office context first, preserve existing structure when an input workbook is present, then apply the smallest auditable set of spreadsheet operations.",
  intent_labels: ["excel", "spreadsheet", "data_analysis", "formula"],
  examples: [
    {
      input: {
        input_path: "pricing-template.xlsx",
        output_path: "consolidation.xlsx",
        changes: [
          {
            op: "set_formula",
            cell: "B2",
            formula: "=VLOOKUP(A2, '[Prices.xlsx]Sheet1'!$A$2:$B$100, 2, FALSE)",
          },
        ],
      },
      output: { ok: true },
      reasoning:
        "Employs exact match VLOOKUP with external workbook references to ensure price integrity across datasets.",
    },
    {
      input: {
        output_path: "summary.xlsx",
        changes: [
          {
            op: "create_pivottable",
            source: "SalesData",
            destination: "Summary!A1",
            name: "SalesSummary",
            rows: ["Region"],
            columns: ["Year"],
            values: ["Amount"],
          },
        ],
      },
      output: { ok: true },
      reasoning:
        "Transforms raw transactional data into executive-level insights using structured aggregation.",
    },
  ],
  parallel_safe: true,
  edge_cases:
    "Large range operations (>10,000 cells) may require batching. Formulas must use A1 notation, respect logical invariants, and avoid hardcoded business values.",
  workflow: {
    overview:
      "Treat Excel work as a governed workbook change: understand the sheet model, preserve formulas and invariants, then apply concise atomic edits that remain auditable.",
    whenToUse: [
      "The task mentions spreadsheets, ranges, formulas, pivots, charts, or numeric reporting.",
      "The user references a spreadsheet file path or wants a spreadsheet file delivered.",
      "The answer depends on workbook structure such as tables, named ranges, or active-sheet context.",
      "The task must preserve an existing workbook template, sheet layout, or downstream reporting structure.",
      "The user needs a plan for spreadsheet edits, not just prose about the data.",
    ],
    process: [
      "Inspect the active sheet, range selection, table schemas, and sample rows before proposing edits.",
      "Prefer editing an existing workbook in place via input_path so existing styles, formulas, validations, and layouts remain intact.",
      "Validate references, anchoring, and downstream logic so formulas preserve workbook invariants and computed values stay formula-driven.",
      "Emit the smallest set of atomic Excel actions needed to complete the task and explain the intended workbook outcome.",
    ],
    rationalizations: [
      {
        excuse:
          "The workbook looks simple, so I can skip checking table schemas and just target guessed ranges.",
        reality:
          "Excel tasks break silently when structure is assumed. Schema and range checks are part of correctness, not optional overhead.",
      },
      {
        excuse: "I can hardcode the value for now and turn it into a formula later.",
        reality:
          "Temporary hardcoding becomes workbook debt. Use references or named ranges from the start so downstream logic stays reliable.",
      },
      {
        excuse:
          "Rebuilding the sheet from scratch is faster than preserving the existing template.",
        reality:
          "Throwing away workbook structure loses formatting, validations, and downstream references. Preserve the template unless the user explicitly wants a rebuild.",
      },
    ],
    redFlags: [
      "Inventing sheet names, table names, or ranges that are not present in officeContext.",
      "Hardcoding values into formulas when references or named ranges should be used instead.",
      "Discarding an existing workbook template when input_path indicates the sheet should be edited rather than recreated.",
      "Applying large formatting or data rewrites without calling out scale and batching risk.",
    ],
    verification: [
      "Every formula uses intentional A1 references and explicit anchoring where needed.",
      "Target ranges and sheet names are either present in context or clearly identified as assumptions.",
      "If input_path is provided, the requested output keeps the workbook's existing layout and only changes the intended cells or summary areas.",
      "The proposed changes preserve business totals, pivots, or other logical invariants listed in context.",
    ],
    references: [
      "Excel tables and named ranges over raw coordinates for maintainability.",
      "Preserve workbook templates and validations unless the user explicitly requests a new workbook.",
      "Only emit spreadsheet output formats the runtime can preserve safely: xlsx, xlsm, csv, or tsv.",
      "Prefer additive workbook edits that are easy to inspect and roll back.",
    ],
  },
  parameters: {
    type: "object",
    required: ["output_path", "changes"],
    properties: {
      input_path: {
        type: "string",
        description:
          "Optional path to an existing xlsx, xlsm, csv, or tsv spreadsheet to preserve and modify",
      },
      output_path: {
        type: "string",
        description: "Path to the output spreadsheet file (.xlsx, .xlsm, .csv, or .tsv)",
      },
      changes: {
        type: "array",
        description:
          "Array of atomic operations: set_value, add_formula, format_range, create_pivottable, get_metadata.",
        items: { type: "object" },
      },
      officeContext: { type: "object", description: "Optional context from Office host" },
    },
  },

  execute: createSkillExecutor<ExcelSkillParams>("excel_expert", async (params) => {
    return await ExcelSkillInvoker.invokeExcelExpert(
      params.input_path ?? "",
      params.output_path,
      params.changes,
      params.officeContext
    );
  }),
};
