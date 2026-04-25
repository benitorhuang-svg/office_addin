---
name: documentation-and-adrs
description: Keep the why aligned with the implementation. Use when workflow contracts, architecture boundaries, or operating models change.
---

# Documentation and ADRs

## Overview

This skill keeps architecture and operating guidance aligned with code. In this repo, workflow contracts affect runtime behavior and contributor behavior, so docs are part of the implementation.

## When to Use

- Changing architecture or workflow contracts
- Updating developer instructions or agent rules
- Introducing a new runtime concept that others must follow

## Process

1. Identify what changed in behavior or operating model.
2. Update the narrowest documentation surface that governs that behavior.
3. Make the documentation reflect the why, not just the new file names.

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "The code is self-explanatory." | Cross-layer workflow systems are not self-evident to the next engineer or agent. |
| "I will update the docs after the code settles." | Delayed docs create drift immediately, especially for shared contracts. |

## Red Flags

- README or instructions still describe the old model
- New runtime concepts exist only in code comments
- Contributors would not know which files are now source of truth

## Verification

- The changed operating model is documented where contributors will read it
- Docs explain why the new pattern exists
- File paths, names, and responsibilities match the implementation
