---
applyTo: "src/agents/skills/**"
---

# src/skills — AI Skill Pipeline

Receives a classified intent from the orchestrator and returns a structured prompt or result.
All skill output feeds back to `copilot-handler.ts` which sends it to the Copilot SDK.

## Entry Points
| File | Export | Use it when |
|------|--------|-------------|
| `skill-orchestrator.ts` | `SkillOrchestrator.route(intent, prompt, context)` | Route any user message to the right skill branch |
| `skill-invoker.ts` | `invokeSkill(name, input)` | Invoke a named skill from `skills-manifest.json` |
| `skills-manifest.json` | Registry | Source of truth for registered skill names and entries |

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

## agents/ — Office Host Skill Implementations
| File | Export | Use it when |
|------|--------|-------------|
| `agent-skill.ts` | `AgentSkill` interface + base | Define a new host-specific skill |
| `excel-skill.ts` | `ExcelSkill` | Handle Excel intent, calls `excel-skill-tool` |
| `word-skill.ts` | `WordSkill` | Handle Word intent via self-corrector |
| `ppt-skill.ts` | `PptSkill` | Handle PPT intent via self-corrector |
| `index.ts` | `getAgentSkill(host)` | Retrieve the right skill by Office host string |

## Skill Routing Logic (skill-orchestrator.ts)
```
route(intent, prompt, context) {
  'excel'   → ExcelSkill.run()
  'word'    → selfCorrect(WordSkill.run, prompt, { domain: 'word' })
  'ppt'     → selfCorrect(PptSkill.run, prompt, { domain: 'ppt' })
  'recap'   → build milestone prompt from context.actionHistory.slice(-5)
  'insight' → chunkAndRetrieve(documentText, query) → analysis prompt
  'general' → pass-through
}
```

## parts/ — Prompt Markdown Templates
Organized by host:
- `parts/excel/` — Excel-specific prompt fragments
- `parts/word/` — Word-specific prompt fragments
- `parts/ppt/` — PPT-specific prompt fragments

## Key Rules
- `intent-classifier.ts` is the ONLY place IntentLabels are defined — do not hardcode strings elsewhere
- `selfCorrect` wraps the generator function — do not call `reviewDesign` directly in orchestrator
- `chunkAndRetrieve` must be called before any document text is sent to the LLM if text length > 4,000 chars
- Tests go in `__tests__/`, import with `../` relative paths (no `.js` extension in test files)
