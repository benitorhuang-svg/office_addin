---
name: incremental-implementation
description: Build in small safe increments. Use when a change crosses contracts, runtime plumbing, and documentation.
---

# Incremental Implementation

## Use When

- A task touches more than one file
- A contract change has multiple downstream consumers
- You need to keep behavior understandable while refactoring

## Process

1. Change the contract or shared helper first.
2. Update immediate consumers next.
3. Finish with tests, docs, and cleanup.

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "It is faster to touch all files at once and sort it out later." | Big-bang edits hide breakage and make contract drift harder to catch. |
| "I can postpone docs and tests until the code feels stable." | Stability is proven by aligned docs and tests, not by instinct. |

## Red Flags

- Large edits with no shared abstraction first
- Repeatedly rewriting the same file with no stable contract
- Mixing unrelated cleanup into behavior work

## Verification

- Downstream files compile against the new contract
- Old and new behavior are not half-mixed
- The resulting diff is explainable as a sequence of safe steps
