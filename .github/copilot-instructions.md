# Nexus Center — Copilot Instructions

## Project Snapshot

- Office Add-in for **Word / Excel / PowerPoint**
- Backend: **Node.js + TypeScript + Express 5**
- Frontend: **Vanilla TypeScript + Webpack**
- Runtime model: **workflow-first expert skills + Office tool surfaces**
- Testing: **Jest** for backend and skill coverage

## Commands

- Dev: `npm run dev`
- Build: `npm run build`
- Typecheck: `npm run typecheck`
- Lint: `npm run lint`
- Backend tests: `npm run test:backend`

## Workflow-First Operating Model

- Start with `.github/skills/using-agent-skills/SKILL.md` when the phase is not obvious.
- Use the project skills in `.github/skills/` to choose the right phase before editing.
- Prefer **plan → implement → verify → review** over jumping straight to code.
- Keep changes small and vertically sliced when multiple layers are involved.
- If a change affects behavior, update the related tests or explain why no test surface exists.
- Use `source-driven-development` when touching external contracts, `debugging-and-error-recovery` when tool paths fail, and `documentation-and-adrs` when workflow or architecture changes.

## Architecture Boundaries

### `src/client/components`
- Pure DOM factories that return a single root `HTMLElement`
- Follow Atomic Design layering strictly
- Do not call backend APIs directly from components

### `src/client/services`
- Service layer only; no direct DOM manipulation
- Backend calls go through `api-orchestrator.ts`
- State changes flow through `NexusStateStore.update()`

### `src/routes`
- Validate request bodies before using `req.body`
- Keep route handlers thin; push business logic into services
- Apply rate limiting and auth in the correct order

### `src/agents` and `src/orchestrator`
- Office expert skills are **workflow-first** and must keep metadata, process, red flags, and verification aligned
- Reuse `self-corrector` and design review gates instead of inventing parallel quality systems
- Prefer structured skill packets over raw prompt-only augmentation

### `src/tools/office-atoms`
- Tool outputs should expose enough context for the runtime to act safely
- Preserve host-awareness and document-awareness in Office tool responses

## Conventions

- Use `.js` extensions in runtime TypeScript imports
- Keep backend code ESM-compatible
- Place tests under `src/**/__tests__/`
- Prefer existing patterns over introducing new abstractions
- Update docs when changing public behavior, workflows, or architecture

## Guardrails

- Never commit secrets or weaken auth / validation flows
- Do not bypass quality gates with silent fallbacks
- Do not replace semantic Word / Excel / PowerPoint operations with vague text instructions
- Do not change API or skill contracts casually; keep interfaces additive when possible

## Review Standard

Before finishing, confirm:

- The change matches the architecture layer rules
- The smallest safe set of files was changed
- The runtime contract, tests, and docs stay aligned
