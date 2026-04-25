---
name: security-and-hardening
description: Keep workflows safe under real inputs. Use when handling auth, prompts, external data, or Office document context.
---

# Security and Hardening

## Use When

- Editing auth or route validation
- Handling document content, prompt files, or external responses
- Adding new runtime metadata that could be surfaced to models

## Process

1. Treat external input and document context as untrusted data.
2. Preserve explicit validation and logging behavior.
3. Surface errors cleanly instead of hiding them.

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "This fallback is harmless because it keeps the flow moving." | Silent fallbacks often hide the precise failure you need to fix and can create unsafe behavior. |
| "The data came from our own runtime, so it is safe by default." | Cross-boundary data should still be treated as untrusted unless the contract guarantees otherwise. |

## Red Flags

- Broad try/catch that hides failures
- Secrets or tokens flowing into logs or checked-in files
- Trusting remote or document data without validation

## Verification

- Validation still occurs at boundaries
- Sensitive values are not exposed
- Failure paths remain explicit and observable
