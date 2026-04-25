---
name: api-and-interface-design
description: Design stable contracts between layers. Use when changing routes, tool payloads, manifests, or skill metadata.
---

# API and Interface Design

## Use When

- Changing request/response shapes
- Updating skill metadata contracts
- Adjusting data passed between orchestrators and tools

## Process

1. Define the contract first.
2. Validate at the boundary, then trust the typed internal data.
3. Prefer additive changes over breaking ones.

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "It is just an internal payload, so consistency is optional." | Internal payload drift still breaks downstream consumers and tests. |
| "I can rename the field in one place and clean up later." | Partial contract changes are one of the easiest ways to leave the repo in a broken state. |

## Red Flags

- Public payloads with inconsistent shapes
- Contract changes made in consumers before shared definitions
- Mixing validation rules across multiple layers

## Verification

- Inputs and outputs stay typed and predictable
- New fields are additive or intentionally migrated
- Boundary validation still happens at the edge
