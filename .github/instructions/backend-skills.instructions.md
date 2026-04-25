---
applyTo: "src/agents/**"
---

# src/agents — AI Skill Runtime

Defines the Office expert skills, shared skill contracts, review helpers, and skill metadata consumed by the orchestrator and Copilot runtime.

## Entry Points
| File | Export | Use it when |
|------|--------|-------------|
| `skill-invoker.ts` | `invokeSkill(name, input)` | Invoke a named skill from `skills-manifest.json` |
| `agent-skill.ts` | `AgentSkill` interface | Define or extend the shared runtime contract for expert skills |
| `index.ts` | `getAllSkills()`, `findSkill()` | Agent registry surface for the built-in expert skills |
| `expert-excel/excel.tools.ts` | `excelSkill` | Workflow-first Excel skill definition |
| `expert-word/word.tools.ts` | `wordSkill` | Workflow-first Word skill definition |
| `expert-ppt/ppt.tools.ts` | `pptSkill` | Workflow-first PowerPoint skill definition |
| `skills/skills-manifest.json` | Registry | Source of truth for persisted skill names and entries |

## atoms/ — Classification & Extraction
| File | Export | Use it when |
|------|--------|-------------|
| `intent-classifier.ts` | `classifyIntent(prompt, context)` → `IntentLabel` | Determine which skill to route to |
| `brand-extractor.ts` | `extractBrandTokens(docContext)` | Pull color/font brand tokens from document |

### IntentLabel values
`'excel' | 'word' | 'ppt' | 'recap' | 'insight' | 'general'`

## molecules/ — Processing Utilities
| File | Export | Trigger |
|------|--------|---------|
| `design-reviewer.ts` | `reviewDesign(content, domain)` → `DesignReview` | Score output quality (0-100, pass ≥ 70) |
| `output-evaluator.ts` | `evaluateOutput(output, criteria)` | Generic quality check |
| `self-corrector.ts` | `selfCorrect(generate, prompt, opts)` → `CorrectionResult` | Auto-healing: score → if < 70 → inject issues → second pass |
| `context-chunker.ts` | `chunkAndRetrieve(text, query, charBudget?)` → `ChunkResult` | TF-IDF smart truncation for texts > 4,000 chars |

### selfCorrect options
```ts
{ domain: 'ppt' | 'word' | 'excel' | 'general', traceId?: string, threshold?: number }
```

### chunkAndRetrieve defaults
- Chunking threshold: 4,000 chars
- Chunk size: 1,200 chars with 200 overlap
- Top-K: 8 chunks, budget: 18,000 chars

## expert-* — Office Host Skill Implementations
| File | Export | Use it when |
|------|--------|-------------|
| `agent-skill.ts` | `AgentSkill` interface + workflow metadata | Extend the shared skill contract |
| `expert-excel/excel.tools.ts` | `excelSkill` | Excel skill metadata and executor |
| `expert-word/word.tools.ts` | `wordSkill` | Word skill metadata and executor |
| `expert-ppt/ppt.tools.ts` | `pptSkill` | PowerPoint skill metadata and executor |
| `shared/workflow-skill-packet.ts` | `buildSkillWorkflowPacket()` | Convert a skill into runtime workflow payloads |

## Runtime Routing Logic
```
Intent classifier
  → router agent / orchestrator
  → expert skill workflow metadata
  → expert prompt + workflow guide
  → self-corrector / QA review
  → Copilot runtime
}
```

## parts/ — Prompt Markdown Templates
Organized by host:
- `parts/excel/` — Excel-specific prompt fragments
- `parts/word/` — Word-specific prompt fragments
- `parts/ppt/` — PPT-specific prompt fragments

## Key Rules
- `intent-classifier.ts` is the ONLY place IntentLabels are defined — do not hardcode strings elsewhere
- `selfCorrect` wraps the generator function — do not call `reviewDesign` directly from expert skill definitions
- `chunkAndRetrieve` must be called before any document text is sent to the LLM if text length > 4,000 chars
- Office expert skills must keep `name`, `version`, `workflow`, tests, and manifest entries aligned
- Prefer workflow packets over prompt-only payloads when sending skill guidance to runtime consumers
- Tests go in `__tests__/`, import with `../` relative paths (no `.js` extension in test files)
