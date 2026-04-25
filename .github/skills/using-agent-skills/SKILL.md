---
name: using-agent-skills
description: Chooses the right project skill for the current phase. Use when starting a task, switching phases, or deciding which workflow should govern the work.
---

# Using Agent Skills

## Overview

This is the meta-skill for the repository. It helps decide which project skill should be active before implementation starts or when work changes phase.

## When to Use

- Starting a new task in the repo
- Switching from planning to implementation or from implementation to review
- Unsure whether the current work is UI, API, runtime, debugging, or documentation focused

## Process

1. Classify the work as plan, build, verify, review, or ship.
2. Select the narrowest applicable skill in `.github/skills/`.
3. Follow that skill's process before coding or changing scope.

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "I already know what to do, so I do not need a skill." | Skills exist to stop predictable failures under pressure, not just to teach basics. |
| "This task touches many areas, so I will skip the phase choice." | Multi-area work needs stronger phase discipline, not less. |

## Red Flags

- Starting implementation without choosing a workflow
- Jumping from coding to cleanup to docs with no phase boundary
- Pulling in unrelated changes because no skill is constraining scope

## Verification

- The current task is mapped to a concrete project skill
- The selected skill matches the current phase of work
- Scope and verification rules are clear before further edits
