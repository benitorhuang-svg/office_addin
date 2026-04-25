---
name: test-driven-development
description: Use tests as proof of behavior. Use when changing runtime contracts, expert skills, or orchestration logic.
---

# Test-Driven Development

## Use When

- Updating expert skill metadata or execution behavior
- Changing orchestrator payloads
- Fixing a regression or naming inconsistency

## Process

1. Identify the behavior that should be asserted.
2. Update or add the smallest test that proves the contract.
3. Keep assertions focused on observable behavior and metadata.

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "This is only metadata, so it does not need tests." | Shared metadata is part of the runtime contract and can break consumers just as easily as behavior code. |
| "The diagnostics are clean, so the tests are unnecessary." | Static cleanliness does not prove the observable contract is still correct. |

## Red Flags

- Updating implementation without touching a clearly affected test
- Testing incidental formatting instead of contract behavior
- Relying on manual inspection where an existing test surface exists

## Verification

- Tests cover the changed contract
- Assertions fail for the old behavior and pass for the new behavior
- No obsolete expectations remain after the change
