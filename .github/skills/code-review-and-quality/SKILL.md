---
name: code-review-and-quality
description: Review changes for correctness, architecture, security, and maintainability. Use before finishing any multi-file change.
---

# Code Review and Quality

## Use When

- Wrapping up a feature or refactor
- A change spans contracts and runtime consumers
- Docs, tests, and implementation must stay aligned

## Process

1. Review for correctness first.
2. Check architecture boundaries and naming consistency next.
3. Confirm tests and docs match the new contract.

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "The diff works locally, so naming drift can be fixed later." | Contract inconsistency compounds quickly across runtime, tests, and manifests. |
| "The review can ignore docs because the code is already correct." | For shared workflows, stale docs are a correctness problem. |

## Red Flags

- Inconsistent naming across runtime, tests, and manifests
- “Works in one place” but other consumers still use old fields
- Explanations or docs that describe the old model

## Verification

- The same contract is reflected in code, tests, and docs
- No stale names or versions remain in affected areas
- The diff is easy to review and reason about
