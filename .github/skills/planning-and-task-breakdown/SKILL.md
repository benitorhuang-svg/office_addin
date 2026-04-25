---
name: planning-and-task-breakdown
description: Break work into small verifiable slices. Use when a task spans multiple files, layers, or workflow stages.
---

# Planning and Task Breakdown

## Use When

- The task touches multiple subsystems
- Skill runtime, Copilot rules, and docs must change together
- The dependency order is not obvious

## Process

1. Identify the contract change first.
2. Sequence runtime, tests, and docs around that contract.
3. Keep each slice independently understandable and reviewable.

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "The tasks are obvious, so I can skip writing them down." | Explicit slices expose hidden dependencies and reduce rework. |
| "I will just adjust the plan as I go." | Unplanned multi-file work usually turns into mixed concerns and missed validation. |

## Red Flags

- “Implement the whole feature” as one step
- No acceptance criteria for a slice
- Docs and tests left until the end with no explicit owner

## Verification

- Every slice has a clear output
- Shared contracts are updated before consumers
- The plan leaves the repo in a coherent state after each phase
