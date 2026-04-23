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
  /** E1: Logic structure over raw data */
  tableSchemas: ExcelTableSchema[];
  /** E1: Small preview for type inference */
  sampleRows?: Record<string, any>[];
  /** P3: Logical invariants that must hold true after changes (e.g., "Total Revenue = Sum of quarters") */
  logicalInvariants?: string[];
}

export interface ExcelSkillParams extends Record<string, unknown> {
  output_path: string;
  changes: ExcelAction[];
  officeContext?: ExcelOfficeContext;
}

export const excelSkill: AgentSkill<ExcelSkillParams> = {
  name: "excel_expert",
  version: "4.0 (Schema-First)",
  description: "Manipulate industrial spreadsheets using logical schemas and safe formula validation.",
  parameters: {
    type: "object",
    required: ["output_path", "changes"],
    properties: {
      output_path: { type: "string", description: "Path to the output file" },
      changes: { type: "array", description: "Array of changes to apply", items: { type: "object" } },
      officeContext: { type: "object", description: "Optional context from Office host" }
    }
  },
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
execute: createSkillExecutor<ExcelSkillParams>("excel_expert", async (params: any) => {
    // E2: Formulas will be validated inside invokeExcelExpert
    return await ExcelSkillInvoker.invokeExcelExpert(
      "",
      params.output_path,
      params.changes,
      params.officeContext
    );
  })
};
