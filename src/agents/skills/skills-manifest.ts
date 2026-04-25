export interface SkillDefinition {
  name?: string;
  description?: string;
  trigger: string;
  logic: string;
  intent_labels: string[];
  engine: string;
  example_inputs: string[];
  example_outputs: string;
  edge_cases?: string;
  input_format: string;
  parallel_safe: boolean;
  version?: string;
  examples?: Array<{
    input: unknown;
    output: unknown;
    reasoning: string;
  }>;
  workflow?: {
    overview: string;
    whenToUse: string[];
    process: string[];
    rationalizations: Array<{
      excuse: string;
      reality: string;
    }>;
    redFlags: string[];
    verification: string[];
    references?: string[];
  };
}

export interface DomainDefinition {
  engine?: string;
  prompt: string;
  skills: Record<string, SkillDefinition>;
}

export interface SkillsManifest {
  version: string;
  routing: {
    strategy: string;
    fallback: string;
    classifier_model: string;
    classifier_max_tokens: number;
  };
  domains: Record<string, DomainDefinition>;
}

/**
 * A3: Skills Manifest with full TypeScript protection.
 * Use 'satisfies' to ensure the structure matches the interface while preserving literal types.
 */
export const SKILLS_MANIFEST = {
  version: "Omni-Arsenal 3.0",
  routing: {
    strategy: "llm_intent_classifier",
    fallback: "keyword_match",
    classifier_model: "gpt-4o-mini",
    classifier_max_tokens: 64,
  },
  domains: {
    excel: {
      engine: "python3 src/agents/skills/parts/excel/excel_expert.py",
      prompt: "src/agents/skills/parts/excel/prompts/excel-expert.md",
      skills: {
        ExcelExpert: {
          name: "excel_expert",
          description:
            "Workflow-first spreadsheet automation for xlsx/xlsm/csv/tsv deliverables, workbook-safe edits, formula-first modeling, pivot summaries, and template-preserving reporting.",
          trigger:
            "Industrial data manipulation, template-preserving workbook edits, spreadsheet file delivery, and spreadsheet automation.",
          logic:
            "Use when query involves spreadsheets, spreadsheet file paths, formulas, existing workbook templates, data tables, pivot analysis, charts, or numeric reporting.",
          intent_labels: ["excel", "spreadsheet", "data_analysis", "chart", "formula"],
          example_inputs: ["Add a SUM formula to column D rows 2 through 50"],
          example_outputs: "Returns Office.js JavaScript snippet.",
          input_format: "{ query: string }",
          parallel_safe: true,
          engine: "python3",
          version: "5.1.0",
          workflow: {
            overview:
              "Inspect workbook structure, preserve existing templates when present, validate formulas, and emit auditable Excel actions.",
            whenToUse: [
              "Spreadsheet or formula work",
              "Workbook-aware automation",
              "Template-preserving workbook edits",
              "Spreadsheet file delivery",
            ],
            process: [
              "Inspect workbook context",
              "Preserve the existing workbook shape",
              "Validate references and invariants",
              "Emit atomic actions",
            ],
            rationalizations: [
              {
                excuse: "I can guess the range and fix it later.",
                reality:
                  "Spreadsheet correctness depends on real structure; guessed ranges create hidden breakage.",
              },
              {
                excuse: "Rebuilding the workbook is faster than preserving the template.",
                reality:
                  "Replacing the workbook loses formatting, validations, and downstream references. Preserve the template unless the user asks for a rebuild.",
              },
            ],
            redFlags: [
              "Invented ranges",
              "Hardcoded formula values",
              "Discarding an existing workbook template",
            ],
            verification: [
              "Check formulas and target ranges",
              "Preserve workbook layout when input_path is provided",
              "Keep output in a supported spreadsheet file format",
            ],
          },
        },
      },
    },
    // ... (rest of the manifest follows the same pattern)
  },
} satisfies SkillsManifest;
