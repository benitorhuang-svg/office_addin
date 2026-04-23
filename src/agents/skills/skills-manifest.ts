export interface SkillDefinition {
  trigger: string;
  logic: string;
  intent_labels: string[];
  engine: string;
  example_inputs: string[];
  example_outputs: string;
  edge_cases?: string;
  input_format: string;
  parallel_safe: boolean;
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
    classifier_max_tokens: 64
  },
  domains: {
    excel: {
      engine: "python3 src/agents/skills/parts/excel/excel_expert.py",
      prompt: "src/agents/skills/parts/excel/prompts/excel-expert.md",
      skills: {
        ExcelExpert: {
          trigger: "Industrial data manipulation and spreadsheet automation.",
          logic: "Use when query involves spreadsheets, formulas, data tables, pivot analysis, charts, or numeric reporting.",
          intent_labels: ["excel", "spreadsheet", "data_analysis", "chart", "formula"],
          example_inputs: ["Add a SUM formula to column D rows 2 through 50"],
          example_outputs: "Returns Office.js JavaScript snippet.",
          input_format: "{ query: string }",
          parallel_safe: true,
          engine: "python3"
        }
      }
    },
    // ... (rest of the manifest follows the same pattern)
  }
} satisfies SkillsManifest;
