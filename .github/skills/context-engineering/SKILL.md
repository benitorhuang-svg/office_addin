---
name: context-engineering
description: Curate the right project context before editing. Use when starting work, switching subsystems, or when the agent is drifting from repo conventions.
---

# Context Engineering

## Use When

- Starting a new task in this repo
- Switching between frontend, routes, services, or skill runtime
- The agent starts inventing APIs or ignoring architecture rules

## Process

1. Read the relevant instruction file in `.github/instructions/`.
2. Read the files you will modify plus one existing example that follows the desired pattern.
3. Load only the docs and source files needed for the current task.

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "I already know this area, so I do not need to reload context." | Stale context is one of the fastest ways to drift from project conventions. |
| "More context is always better." | Unfocused context lowers output quality; load only what the task needs. |

## Red Flags

- Editing before reading the target files
- Treating stale docs as source of truth over actual code
- Pulling in large unrelated context that dilutes focus

## Verification

- The chosen files match the task scope
- The implementation follows an existing repo pattern
- No invented symbol or API is introduced without evidence
