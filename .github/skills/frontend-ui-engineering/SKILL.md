---
name: frontend-ui-engineering
description: Build production-quality UI for the Office task pane. Use when editing components, visual state, or task pane interactions.
---

# Frontend UI Engineering

## Use When

- Editing `src/client/components`
- Changing task pane layout, controls, or display states
- Introducing new UI-facing workflow cues

## Process

1. Keep factories pure and return one root element.
2. Push state and backend interaction into the service layer.
3. Preserve accessibility, loading states, and existing design tokens.

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "This is a small UI tweak, so architecture boundaries do not matter." | Small boundary violations accumulate and make the task pane harder to reason about. |
| "I can skip loading and error states because the UI already exists." | Modified UI still has to behave correctly across all states. |

## Red Flags

- DOM manipulation inside services
- Components calling backend utilities directly
- Visual changes that ignore empty, loading, or error states

## Verification

- Layer boundaries remain intact
- UI behavior is traceable to service/state changes
- The result fits the existing design system
