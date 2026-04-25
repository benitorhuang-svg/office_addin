---
name: debugging-and-error-recovery
description: Triage failures methodically and keep moving. Use when validation breaks, tooling fails, or the runtime behaves differently than expected.
---

# Debugging and Error Recovery

## Overview

When a tool path fails, recover deliberately. Reproduce the failure, localize it, try the next viable path, and leave the system in a safer state than before.

## When to Use

- Build, lint, or test commands fail
- A tool execution path is unavailable
- A runtime payload or contract behaves unexpectedly

## Process

1. Reproduce or capture the failing path and its exact constraint.
2. Localize whether the issue is environment, contract, or implementation.
3. Try the next safe validation or execution path and harden the system against silent failure.

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "The environment is broken, so I cannot validate anything." | When one path fails, switch to the next meaningful validation path and keep reducing uncertainty. |
| "The failure is probably unrelated to my change." | Treat every unexplained failure as relevant until proven otherwise. |

## Red Flags

- Stopping at the first broken tool path
- Treating missing runtime support as proof the code is correct
- Silent fallbacks that hide failed validation or sync

## Verification

- The failure source is explicitly named
- A fallback validation or execution path was attempted
- Any silent failure mode discovered during debugging was hardened
