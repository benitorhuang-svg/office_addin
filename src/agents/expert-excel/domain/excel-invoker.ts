import path from "path";
import { invokeExcelSkill } from "@infra/services/bridge-client.js";

type BridgeExcelChange = Record<string, unknown>;
type ExcelOfficeContextPayload = Record<string, unknown>;

const EXCEL_ACTION_NAME_MAP: Record<string, string> = {
  SET_VALUE: "set_value",
  SET_FORMULA: "add_formula",
  FORMAT_RANGE: "format_range",
  CREATE_PIVOT_TABLE: "create_pivottable",
  DEFINE_TABLE_SCHEMA: "define_table_schema",
};

function requireObject(value: unknown, errorMessage: string): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  throw new Error(errorMessage);
}

function requireString(value: unknown, errorMessage: string): string {
  if (typeof value === "string" && value.trim().length > 0) {
    return value.trim();
  }
  throw new Error(errorMessage);
}

function requireStringArray(value: unknown, fieldName: string): string[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(`${fieldName} must be a non-empty string array`);
  }
  return value.map((item, index) =>
    requireString(item, `${fieldName}[${index}] must be a non-empty string`)
  );
}

function normalizeCellReference(value: unknown, fieldName: string): string {
  const ref = requireString(value, `${fieldName} is required`);
  if (ref.includes(":")) {
    throw new Error(`${fieldName} must reference a single cell, not a range (${ref})`);
  }
  return ref;
}

function normalizeFormula(change: BridgeExcelChange): string {
  const rawFormula = change["formula"] ?? change["value"];
  const formula = requireString(rawFormula, "Formula value is required");
  return formula.startsWith("=") ? formula : `=${formula}`;
}

function normalizePivotValues(
  value: unknown
): Array<{ field: string; func: "SUM" | "COUNT" | "AVERAGE" }> {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error("Pivot values must be a non-empty array");
  }

  return value.map((item, index) => {
    if (typeof item === "string") {
      return { field: item, func: "SUM" as const };
    }

    const spec = requireObject(item, `Pivot value at index ${index} must be a string or object`);
    const field = requireString(spec["field"], `Pivot value field at index ${index} is required`);
    const funcValue = spec["func"] ?? "SUM";

    if (funcValue === "SUM" || funcValue === "COUNT" || funcValue === "AVERAGE") {
      return { field, func: funcValue };
    }

    throw new Error(
      `Unsupported pivot aggregation function at index ${index}: ${String(funcValue)}`
    );
  });
}

function normalizeExcelChange(change: unknown, index: number): BridgeExcelChange {
  const op = requireObject(change, `Excel change at index ${index} must be an object`);
  const rawAction =
    op["op"] ??
    op["action"] ??
    (typeof op["type"] === "string"
      ? (EXCEL_ACTION_NAME_MAP[op["type"]] ?? op["type"])
      : undefined);
  const actionName = requireString(
    rawAction,
    `Excel change at index ${index} is missing an action name`
  );

  switch (actionName) {
    case "set_value":
      return {
        op: "set_value",
        cell: normalizeCellReference(op["cell"] ?? op["range"], `changes[${index}].cell`),
        value: op["value"],
      };
    case "set_formula":
    case "add_formula":
      return {
        op: "add_formula",
        cell: normalizeCellReference(op["cell"] ?? op["range"], `changes[${index}].cell`),
        formula: normalizeFormula(op),
      };
    case "format_range": {
      const format = op["format"]
        ? requireObject(op["format"], `changes[${index}].format must be an object`)
        : undefined;
      return {
        op: "format_range",
        range: requireString(op["range"], `changes[${index}].range is required`),
        bold: op["bold"] ?? format?.["bold"],
        fill_color: op["fill_color"] ?? op["fillColor"] ?? format?.["fillColor"],
        font_color: op["font_color"] ?? op["fontColor"],
        number_format: op["number_format"] ?? op["numberFormat"] ?? format?.["numberFormat"],
      };
    }
    case "set_column_width":
      return {
        op: "set_column_width",
        column: requireString(op["column"], `changes[${index}].column is required`),
        width: op["width"],
      };
    case "merge_cells":
      return {
        op: "merge_cells",
        range: requireString(op["range"], `changes[${index}].range is required`),
      };
    case "add_header_row":
      return {
        op: "add_header_row",
        row: op["row"],
        headers: op["headers"],
        sheet: op["sheet"],
      };
    case "create_pivottable":
      return {
        op: "create_pivottable",
        source: requireString(op["source"], `changes[${index}].source is required`),
        destination: requireString(op["destination"], `changes[${index}].destination is required`),
        name: requireString(
          op["name"] ?? `PivotTable${index + 1}`,
          `changes[${index}].name is required`
        ),
        rows: requireStringArray(op["rows"], `changes[${index}].rows`),
        columns: Array.isArray(op["columns"])
          ? op["columns"].map((item, columnIndex) =>
              requireString(
                item,
                `changes[${index}].columns[${columnIndex}] must be a non-empty string`
              )
            )
          : [],
        values: normalizePivotValues(op["values"]),
      };
    case "get_metadata":
      return { op: "get_metadata" };
    case "define_table_schema":
      throw new Error("define_table_schema is not currently supported by the Excel bridge");
    default:
      throw new Error(`Unsupported Excel action: ${actionName}`);
  }
}

export function normalizeExcelChanges(changes: unknown[]): BridgeExcelChange[] {
  return changes.map((change, index) => normalizeExcelChange(change, index));
}

/**
 * Excel Skill Invoker
 * Dispatches AI agent requests to the FastAPI Skill Bridge (HTTP).
 * Eliminates cold-start latency vs. spawning a new Python process per call.
 */
export class ExcelSkillInvoker {
  /**
   * Invoke the ExcelExpert skill via the skill bridge HTTP API.
   */
  static async invokeExcelExpert(
    inputPath: string,
    outputPath: string,
    changes: unknown[],
    officeContext?: unknown
  ): Promise<unknown> {
    return invokeExcelSkill({
      input_path: inputPath,
      output_path: outputPath,
      changes: normalizeExcelChanges(changes),
      office_context: officeContext
        ? (requireObject(
            officeContext,
            "Excel officeContext must be an object"
          ) as ExcelOfficeContextPayload)
        : undefined,
    });
  }

  /**
   * Load the expert prompt for Excel operations.
   */
  static getPromptPath(): string {
    return path.resolve(process.cwd(), "src/agents/expert-excel/prompts/excel-expert.md");
  }
}
