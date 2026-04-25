---
name: source-driven-development
description: Ground changes in authoritative sources. Use when changing framework behavior, library integration, or external tool contracts.
---

# Source-Driven Development

## Overview

Use official docs, repo patterns, and verified contracts before changing integrations. This is especially important in this project because Office, Copilot SDK, and runtime tooling all have brittle boundaries.

## When to Use

- Editing Copilot SDK integration
- Changing Office host contracts or tool payloads
- Modifying build scripts, manifests, or external provider flows

## Process

1. Identify the external contract or framework behavior being changed.
2. Check project-local precedent first, then official docs or authoritative sources.
3. Implement against verified behavior, not memory or guesswork.

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "I remember how this API works." | Memory is unreliable; stale assumptions create expensive integration bugs. |
| "The local code probably proves the behavior." | Local code may already be wrong or outdated. Verify external contracts at the source. |

## Red Flags

- New integration code with no evidence of verified contract shape
- Guessing import behavior, runtime packaging, or host capabilities
- Copying patterns from unrelated libraries

## Verification

- The changed contract is backed by a verified source or strong local precedent
- New assumptions about external behavior are documented in code or docs
- No external API shape is inferred without evidence
