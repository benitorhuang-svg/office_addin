---
name: word-expert
description: Workflow-first Word automation for structured drafting, semantic editing, and brand-safe document changes. Use when a request depends on outline, styles, protected ranges, or controlled rewrites.
---

# Word Expert

## Overview

Word Expert treats document work as structured editing. It preserves semantic hierarchy, respects document constraints, and emits Word-native actions instead of collapsing everything into plain text.

Supported deliverable: `.docx`

## When to Use

- The request involves drafting, rewriting, outlining, formatting, or assembling a Word document.
- The user mentions a `.docx` file path or wants the final deliverable as a Word document.
- The current document has headings, named styles, a glossary, or protected ranges that must be respected.
- The response should become executable Word actions or section-aware writing guidance.

## Inputs

- `output_path`
- `changes`
- `officeContext.availableNamedStyles`
- `officeContext.protectedRanges`
- `officeContext.glossary`
- `officeContext.documentOutline`

## Process

1. **Inspect document structure**: read the available styles, section outline, protected ranges, and glossary constraints.
2. **Preserve the document template**: if `input_path` is provided, keep the existing .docx layout, styles, headers, and sections unless the task explicitly asks for a rebuild.
3. **Plan the editorial move**: decide whether the task is drafting, rewriting, restructuring, or formatting, then map it to document sections.
4. **Emit semantic edits**: return Word actions that preserve hierarchy, avoid protected content, and keep formatting explicit.

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "It is faster to bold some text than to use styles." | Appearance-only formatting breaks document semantics and makes later automation brittle. |
| "The protected range is probably okay to update because the user wants changes." | Protected content is an explicit boundary. Do not cross it without a clear override. |
| "Rebuilding the document is easier than preserving the template." | Recreating the file loses headers, styles, section settings, and template conventions. Preserve the existing `.docx` unless the user explicitly asks for a rebuild. |

## Red Flags

- Replacing semantic headings with appearance-only formatting.
- Rewriting protected content or ignoring glossary terminology constraints.
- Throwing away an existing `.docx` template for a task that only asked for targeted edits.
- Returning freeform prose when the user asked for document operations or section-specific edits.

## Verification

- Heading transitions remain legal relative to the document outline.
- Protected ranges remain untouched unless the user explicitly overrides them.
- Existing `.docx` layout and styles are preserved when `input_path` is supplied.
- Formatting guidance uses named styles or concrete Word actions, not vague visual language.

## Atomic Operations

- `input_path` (optional, but preferred when editing an existing .docx template)
- `insert_paragraph`
- `insert_heading`
- `find_replace`
- `replace_section`
- `apply_named_style`
- `set_font`
- `add_image`
- `add_page_break`

## Example

```json
{
  "input_path": "templates/Executive_Summary_Template.docx",
  "output_path": "reports/Executive_Summary.docx",
  "changes": [
    { "op": "insert_heading", "text": "Q1 Strategic Overview", "level": 1 },
    {
      "op": "insert_paragraph",
      "text": "This report outlines the primary growth drivers and cost-saving measures implemented during the first quarter.",
      "style": "Body"
    }
  ]
}
```

This is valid because it starts with semantic structure, uses document-aware styling, and keeps the generated content aligned with the target section.
