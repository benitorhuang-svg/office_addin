---
name: ppt-expert
description: Workflow-first PowerPoint automation for narrative slide design, grid-based layout planning, and brand-safe deck edits. Use when a request depends on slide structure, layout, or presentation readability.
---

# PPT Expert

## Overview

PPT Expert treats presentation work as narrative design with execution constraints. It plans the message first, maps content into the slide grid second, and only then emits PowerPoint actions that respect theme and readability.

Supported deliverable: `.pptx`

## When to Use

- The request references PowerPoint, slides, decks, speaker notes, or presentation layouts.
- The user mentions a `.pptx` file path or wants the final deliverable as a presentation deck.
- The answer depends on placement, slide geometry, theme tokens, or readable visual hierarchy.
- The output should become PowerPoint actions or deck-ready content instead of generic presentation advice.

## Inputs

- `output_path`
- `changes`
- `officeContext.slideWidthPts`
- `officeContext.slideHeightPts`
- `officeContext.themeColors`

## Process

1. **Plan the story**: decide what each slide must communicate and keep the deck scoped to the minimum useful narrative.
2. **Preserve the deck template**: if `input_path` is provided, keep the existing .pptx layouts, masters, and speaker-note conventions unless the task explicitly asks for a rebuild.
3. **Map the layout**: place text, media, and emphasis within the 12x12 grid so hierarchy and spacing are intentional.
4. **Apply design constraints**: enforce theme consistency, readability, and supported PowerPoint capabilities before execution.

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "I can fit everything on one slide if I make the font smaller." | Unreadable slides are a failed result. Split the story across slides instead. |
| "The layout does not matter as long as the content is present." | In presentations, layout is part of the message. Hierarchy and spacing are correctness concerns. |
| "Rebuilding the deck is easier than preserving the template." | Recreating the file loses master layouts, theme bindings, and speaker-note conventions. Preserve the existing `.pptx` unless the user explicitly asks for a rebuild. |

## Red Flags

- Slides overloaded with bullets or decorative elements that dilute the message.
- Font sizes below presentation-safe thresholds or insufficient contrast against the slide background.
- Throwing away an existing `.pptx` template for a task that only asked for targeted slide edits.
- Content placed outside the slide grid or instructions that depend on unsupported animation behavior.

## Verification

- Each slide has a clear narrative role and its elements fit within the grid.
- Typography and colors stay within readability and brand constraints.
- Existing `.pptx` layouts and template conventions are preserved when `input_path` is supplied.
- The emitted actions can execute without relying on unsupported transitions or hidden assumptions.

## Atomic Operations

- `input_path` (optional, but preferred when editing an existing .pptx template)
- `add_slide`
- `add_title_slide`
- `add_shape`
- `insert_text`
- `set_font`
- `add_image`
- `set_background_color`
- `set_slide_notes`

## Example

```json
{
  "input_path": "templates/Q1_Template.pptx",
  "output_path": "quarterly_reports/Q1_Performance.pptx",
  "changes": [
    { "op": "add_title_slide", "title": "2026 Q1 Business Review", "subtitle": "Nexus Center Excellence" },
    {
      "op": "add_slide",
      "title": "Revenue Growth",
      "body": "• Revenue grew by 15% YoY\n• Driven by enterprise segment",
      "font_size_pt": 24
    }
  ]
}
```

This is valid because it establishes a slide-level narrative, keeps the layout readable, and uses concrete PowerPoint operations instead of hand-wavy design advice.
