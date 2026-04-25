---
name: excel-expert
description: Workflow-first Excel automation for schema-aware spreadsheet analysis and workbook-safe changes. Use when a request depends on formulas, ranges, pivots, tables, or chart-ready reporting.
---

# Excel Expert

## Overview

Excel Expert turns spreadsheet requests into safe workbook operations. It assumes workbook correctness matters as much as the answer itself, so it inspects structure first, validates formulas next, and only then emits atomic Excel actions.

Supported deliverables: `.xlsx`, `.xlsm`, `.csv`, `.tsv`

## When to Use

- The request references Excel, sheets, tables, pivots, formulas, ranges, or chart preparation.
- The user mentions a spreadsheet file path or wants a spreadsheet file produced as the final deliverable.
- The answer must account for workbook structure such as named ranges, sample rows, or logical invariants.
- The user needs executable spreadsheet edits rather than narrative-only advice.

## Inputs

- `input_path` (optional, but preferred when modifying an existing workbook or template)
- `output_path`
- `changes`
- `officeContext.tableSchemas`
- `officeContext.sampleRows`
- `officeContext.logicalInvariants`

## Process

1. **Inspect the workbook model**: identify the active sheet, selected range, table schemas, and any sample rows available in context.
2. **Preserve the workbook shape**: if `input_path` is provided, keep existing sheet layout, formatting, validations, and formulas unless the task explicitly asks for structural changes.
3. **Validate the plan**: confirm target ranges exist, formulas use intentional anchoring, and requested edits do not break invariants.
4. **Emit atomic actions**: return the smallest safe set of Excel operations needed to complete the task.

## Requirements for Outputs

- Prefer formulas over hardcoded computed values.
- Preserve existing workbook templates whenever an input workbook is supplied.
- Return a spreadsheet file, not a prose-only answer, when the task is framed as spreadsheet work.
- Keep changes auditable: use small atomic operations instead of recreating large sections without need.
- Treat formula errors as defects to prevent, not cleanup work for later.

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "The workbook looks simple, so I can just guess the range." | Spreadsheet correctness depends on real structure. Guessed ranges create hidden breakage. |
| "I will hardcode the value now and convert it to a formula later." | Temporary hardcoding becomes workbook debt and breaks downstream trust. Use references or named ranges immediately. |
| "Rebuilding the workbook from scratch is simpler than preserving the template." | Existing workbook structure often carries formatting, validations, downstream references, and stakeholder expectations. Preserve it unless the user explicitly wants a rebuild. |

## Red Flags

- Invented sheet names, table names, or ranges that are not supported by context.
- Formulas with hardcoded business constants when references or named ranges should be used.
- Replacing an existing workbook template even though the task only asked for targeted edits.
- Large-scale formatting or cell rewrites without acknowledging batching or performance impact.

## Verification

- Formula references are valid and anchoring is deliberate.
- Target ranges and structures are grounded in the workbook context or clearly marked as assumptions.
- Existing workbook layout is preserved when `input_path` is used.
- Output format is a real spreadsheet deliverable (`.xlsx`, `.xlsm`, `.csv`, `.tsv`).
- Workbook invariants such as totals, pivots, or dependent calculations remain consistent.

## When Not to Use

- The user only wants a prose explanation of spreadsheet logic with no workbook edits.
- The task is really a document-writing or slide-design task better handled by Word or PowerPoint skills.
- Required workbook structure is missing and the user has not provided enough context to define it safely.

## Atomic Operations

- `set_value`
- `set_formula`
- `format_range`
- `create_pivottable`
- `set_column_width`
- `merge_cells`
- `add_header_row`

## Example

```json
{
  "output_path": "analytics/summary.xlsx",
  "changes": [
    {
      "op": "create_pivottable",
      "source": "SalesData",
      "destination": "Summary!A1",
      "name": "SalesSummary",
      "rows": ["Region"],
      "columns": ["Year"],
      "values": ["Amount"]
    }
  ]
}
```

This is valid because it works from structured data, produces a single auditable operation, and preserves the workbook as the system of record.
