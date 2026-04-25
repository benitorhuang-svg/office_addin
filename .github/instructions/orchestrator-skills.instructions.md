---
applyTo: "src/orchestrator/**"
---

# src/orchestrator — Workflow Skill Orchestration

This layer coordinates routing, prompt composition, and workflow packet delivery for Office expert skills.

## Real Entry Points
| File | Responsibility |
|------|----------------|
| `agent-orchestrator.ts` | Cross-app fan-out and workflow packet assembly for Excel / Word / PPT / omni bridge |
| `workflow-graph.ts` | Main execution graph: routing → expert instructions → QA review → completion |
| `skill-registry.ts` | Runtime registration, validation, and OpenAI tool export for agent skills |
| `register-all-skills.ts` | Boot-time discovery and registration |

## Key Rules
- Prefer structured workflow packets over prompt-only augmentation
- Keep expert skill IDs, manifest entries, tests, and tool payloads aligned
- Do not bypass `self-corrector` / QA review flows with parallel ad hoc review logic
- When composing multi-skill prompts, preserve workflow metadata and verification steps
