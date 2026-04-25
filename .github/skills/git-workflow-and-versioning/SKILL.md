---
name: git-workflow-and-versioning
description: Keep changes reviewable and version intent clear. Use when changing shared contracts, manifests, or multi-file runtime behavior.
---

# Git Workflow and Versioning

## Overview

Shared runtime contracts need disciplined change boundaries. This skill keeps diffs reviewable and version changes intentional.

## When to Use

- Changing shared types or manifests
- Renaming skills or altering runtime payloads
- Preparing a multi-file refactor for review

## Process

1. Keep shared contract changes grouped with their direct consumers.
2. Make version strings and naming changes deliberate and consistent.
3. Avoid unrelated cleanup in the same change set.

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "I am already touching the file, so I should clean up adjacent issues." | Unrelated cleanup hides the real contract change and makes review harder. |
| "The version string is minor; it does not need consistency everywhere." | Version drift across code, tests, and manifests causes toolchain and review confusion. |

## Red Flags

- Contract, manifest, and tests disagree on names or versions
- One diff mixes behavior work with opportunistic cleanup
- Reviewers would need repository-wide context to understand the change

## Verification

- Shared names and versions are consistent in all affected files
- The diff groups related contract changes coherently
- No unrelated cleanup was bundled into the same review unit
