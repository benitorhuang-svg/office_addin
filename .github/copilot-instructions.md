# Nexus Center — Copilot Agent Instructions

## Project Overview
Office Add-in (Word / Excel / PowerPoint) powered by GitHub Copilot SDK.
- **Backend**: Node.js + TypeScript, Express 5, `"type":"module"` (NodeNext resolution)
- **Frontend**: Vanilla TypeScript compiled via Webpack, mounted in Office task pane
- **Design System**: Atomic Design (atoms → molecules → organisms → templates)
- **Test Stack**: Jest 29 + ts-jest CJS mode, pattern `**/src/**/__tests__/**/*.test.ts`

---

## Folder Map — Quick Navigation

### Backend Entry Points
| File | Purpose |
|------|---------|
| `src/server.ts` | Express app bootstrap, mounts all routers |
| `src/config/env.ts` | Environment variable schema & defaults |
| `src/shared/types.ts` | Shared interfaces: `NexusState`, `NexusSystemState` |

### `src/infra/` — Infrastructure Primitives
| Layer | Files | Responsibility |
|-------|-------|---------------|
| atoms | `logger.ts`, `app-error.ts`, `latency-tracker.ts`, `fetcher.ts` | Logging, error classes, HTTP helpers |
| molecules | `app-factory.ts`, `lifecycle-manager.ts`, `telemetry-middleware.ts` | Express factory, graceful shutdown, request timing |
| organisms | `server-orchestrator.ts` | Wires HTTP/HTTPS server + lifecycle |

### `src/routes/` — HTTP API Layer
| Layer | Files | Responsibility |
|-------|-------|---------------|
| atoms | `request-validator.ts`, `status-html.ts` | Input validation middleware, status page |
| molecules | `rate-limiter.ts`, `session-store.ts` | Rate limiting, express-session config |
| organisms | `api-router.ts`, `auth-router.ts`, `copilot-handler.ts`, `oauth-service.ts` | Main API routes, auth flows, Copilot stream handler |

> **`copilot-handler.ts`** is the most important route: handles `/api/chat`, streams Copilot responses, tracks TTFT + tokens/sec, broadcasts `SYSTEM_STATE_UPDATED` via WebSocket.

### `src/services/` — Business Services
#### `src/services/molecules/`
| File | Responsibility |
|------|---------------|
| `nexus-socket.ts` | WebSocket relay (`NexusSocketRelay.broadcast()`) |
| `system-state-store.ts` | Singleton: `power`, `provider`, `isWarming`, `isStreaming`, `tokensPerSec`, `ttft`, `activePersona` |

#### `src/services/copilot/atoms/`
| File | Responsibility |
|------|---------------|
| `presets.ts` | Persona definitions (Excel Analyst, PPT Designer, etc.) |
| `prompt-template.ts` | System prompt builder |
| `permission-policy.ts` | Tool permission rules by preset |
| `tool-surface-policy.ts` | Which tools surface per Office host |
| `core-config.ts` | SDK client config factory |
| `types.ts` | Internal Copilot service types |

#### `src/services/copilot/molecules/`
| File | Responsibility |
|------|---------------|
| `sdk-turn-orchestrator.ts` | Single chat turn lifecycle |
| `sdk-retry-engine.ts` | Retry with backoff |
| `fallback-chain.ts` | Provider fallback (Copilot → GitHub Models → Gemini) |
| `client-manager.ts` | SDK client pool |
| `tool-registry.ts` | Dynamic tool registration |
| `option-resolver.ts` | Merge request options with defaults |
| `adaptive-config.ts` | Runtime config hot-swap |
| `session-lifecycle.ts` | Session open/close hooks |

#### `src/services/copilot/organisms/`
| File | Responsibility |
|------|---------------|
| `completion-orchestrator.ts` | Top-level completion entry (chooses provider) |
| `sdk-orchestrator-v2.ts` | GitHub Copilot SDK streaming orchestrator |
| `gemini-cli-orchestrator.ts` | Gemini CLI streaming bridge |
| `gemini-rest-service.ts` | Gemini REST API fallback |
| `github-models-service.ts` | GitHub Models (Azure OpenAI) service |
| `health-prober.ts` | Provider health checks |

#### `src/services/copilot/tools/`
| Folder | Files | Responsibility |
|--------|-------|---------------|
| `core/` | `python-executor-tool.ts`, `google-search-tool.ts` | Python sandbox, Google search |
| `office/` | `excel-skill-tool.ts`, `word-skill-tool.ts`, `powerpoint-skill-tool.ts`, `create-excel-chart-tool.ts` | Office JS actions exposed as Copilot tools |
| `shared/` | _(shared tool helpers)_ | Common tool utilities |
| `index.ts` | — | `getSessionTools(host)` — builds tool list by Office host |

### `src/agents/skills/` — AI Skill Pipeline
| File / Folder | Responsibility |
|---------------|---------------|
| `skill-orchestrator.ts` | **Main router** — classifies intent → dispatches to correct skill branch |
| `skill-invoker.ts` | Invokes individual skills from manifest |
| `skills-manifest.json` | Skill registry (name, description, entry) |

#### `src/agents/skills/atoms/`
| File | Responsibility |
|------|---------------|
| `intent-classifier.ts` | Keyword + LLM hybrid classifier → `IntentLabel` (`excel`, `word`, `ppt`, `recap`, `insight`, `general`) |
| `brand-extractor.ts` | Extracts brand/color tokens from document context |

#### `src/agents/skills/molecules/`
| File | Responsibility |
|------|---------------|
| `design-reviewer.ts` | 5-dimension heuristic scorer (InfoArch/VisualPoetry/Emotional/Usability/Brand). Pass ≥ 70/100 |
| `output-evaluator.ts` | Generic output quality evaluator |
| `self-corrector.ts` | Auto-Healing Loop: first-pass → review → if score < threshold → inject issues → second-pass |
| `context-chunker.ts` | TF-IDF smart truncation: chunks text > 4,000 chars, returns top-K within char budget |

#### `src/agents/skills/agents/`
| File | Responsibility |
|------|---------------|
| `agent-skill.ts` | `AgentSkill` interface + base class |
| `excel-skill.ts` | Excel-specific skill implementation |
| `word-skill.ts` | Word-specific skill implementation |
| `ppt-skill.ts` | PowerPoint-specific skill implementation |
| `index.ts` | Agent skill registry — `getAgentSkill(host)` |

#### `src/agents/skills/parts/`
Prompt markdown files and sub-skill fragments. Organized by Office host (excel/, word/, ppt/).

---

### Frontend Entry Points
| File | Purpose |
|------|---------|
| `src/client/entries/taskpane-entry.ts` | Main task pane bootstrap, mounts `AppOrchestrator` |
| `src/client/entries/monitor-entry.ts` | Monitor panel entry |
| `src/client/sw.ts` | Service worker |

### `src/client/components/` — UI Components (Atomic Design)
#### atoms — Primitive UI Elements
`Button`, `Input`, `LayoutBox`, `NexusCard`, `Typography`, `Icon`, `FluentButton`, `FluentInput`, `Divider`, `status-badge`, `status-dot`, `status-icon`, `StepItem`

#### molecules — Composed UI Blocks
| Component | Purpose |
|-----------|---------|
| `StatusHUD.ts` | Live telemetry bar: tokens/sec, TTFT, active persona |
| `ZenithInsightButton.ts` | Floating FAB (bottom-right) with insight/recap menu |
| `ZenithInsightCard.ts` | HUD overlay card for insight/recap results |
| `chat-bubble.ts` | Single chat message bubble |
| `model-selector.ts` | Model/provider picker |
| `auth-card.ts` | Auth UI card |
| `context-manager.ts` | Document context display |
| `task-stepper.ts` | Multi-step task progress |
| `suggestion-cards.ts` | Quick prompt suggestion chips |
| `prompt-group.ts` | Grouped prompt templates |
| `activity-log.ts` | Action activity log |
| `expert-hub.ts` | Expert persona selector hub |
| `Toast.ts` | Notification toast |

#### organisms — Page-Level Sections
| Component | Purpose |
|-----------|---------|
| `MainChatOrganism.ts` | Full chat panel (mounts all molecules + ZenithInsightButton FAB) |
| `PromptOrganism.ts` | Prompt input area with send controls |
| `AuthGateway.ts` | Auth gate wrapper |
| `header.ts` | App header |
| `history-container.ts` | Chat history scroller |
| `monitor.ts` | Monitor panel organism |

### `src/client/services/` — Frontend Services (Atomic Design)
#### atoms — Primitive Services
| File | Responsibility |
|------|---------------|
| `api-client.ts` | Fetch wrapper for backend API |
| `api-types.ts` | API request/response types |
| `socket-types.ts` | WebSocket event type definitions (incl. `SYSTEM_STATE_UPDATED` payload) |
| `socket-config.ts` | Socket.IO connection config |
| `preset-manager.ts` | Persona preset management |
| `prompt-template.ts` | Client-side prompt templates |
| `storage-provider.ts` | LocalStorage wrapper |
| `enums.ts` | Client enums |
| `types.ts` | Client-side types |
| `ui-types.ts` | UI-specific types |

#### molecules — Composed Services
| File | Responsibility |
|------|---------------|
| `global-state.ts` | `NexusStateStore` singleton — central reactive state (subscribe/update) |
| `ActionHistory.ts` | Ring buffer (max 50) of user actions for Recap feature |
| `socket-service.ts` | Socket.IO client wrapper, event routing |
| `StreamEngine.ts` | SSE/stream reader |
| `conversation-manager.ts` | Conversation history management |
| `excel-actions.ts` | Excel JS API actions |
| `word-actions.ts` | Word JS API actions |
| `powerpoint-actions.ts` | PowerPoint JS API actions |
| `office-actions.ts` | Cross-host Office JS utilities |
| `auth-aggregator.ts` | Auth state aggregation |
| `DiagnosticEngine.ts` | Client-side diagnostics |
| `model-manager.ts` | Model selection state |
| `SessionManager.ts` | Session lifecycle |
| `HistoryManager.ts` | Chat history persistence |
| `i18n-service.ts` | i18n (en/zh-TW) |

#### organisms — High-Level Orchestrators
| File | Responsibility |
|------|---------------|
| `api-orchestrator.ts` | `sendToCopilot()` — main function to send messages to backend |
| `AppOrchestrator.ts` | App boot sequence, mounts UI |
| `chat-orchestrator.ts` | Chat session orchestration |
| `RenderManager.ts` | DOM render lifecycle |
| `StitchConnector.ts` | Office ribbon ↔ task pane bridge |

---

## Key Data Flows

### Chat Request Flow
```
User input
  → PromptOrganism (client)
  → api-orchestrator.sendToCopilot()
  → POST /api/chat (copilot-handler.ts)
  → completion-orchestrator → sdk-orchestrator-v2
  → [streams tokens back]
  → copilot-handler tracks TTFT + tokens/sec
  → broadcasts SYSTEM_STATE_UPDATED via nexus-socket
  → client socket-service → NexusStateStore.update()
  → StatusHUD re-renders telemetry
```

### Skill Routing Flow
```
User message
  → skill-orchestrator.route(intent, prompt, context)
  → intent-classifier → IntentLabel
  → switch:
      'excel'   → excel-skill-tool
      'word'    → self-corrector(word) → word-skill-tool
      'ppt'     → self-corrector(ppt) → ppt-skill-tool
      'recap'   → session checkpoint from actionHistory
      'insight' → context-chunker → document analysis prompt
      'general' → pass-through
```

### State Broadcast Flow
```
copilot-handler (server)
  → SystemStateStore.update({ tokensPerSec, ttft, activePersona })
  → NexusSocketRelay.broadcast('SYSTEM_STATE_UPDATED', payload)
  → taskpane-entry.ts socket handler
  → NexusStateStore.update()
  → StatusHUD.subscribe() callback → DOM update
```

---

## Conventions
- **Import paths**: Always use `.js` extension in imports (NodeNext resolution), e.g. `import { x } from './foo.js'`
- **Module system**: Backend is ESM (`"type":"module"`). Jest uses ts-jest in CJS mode (inline tsconfig override)
- **Tests**: Place in `src/**/  __tests__/*.test.ts`, import with `../` relative paths (no `.js` extension in test imports)
- **Atomic Design rule**: atoms have zero dependencies on molecules/organisms; molecules can use atoms only; organisms can use anything
- **State mutations**: Always go through `NexusStateStore.update()` on client, `SystemStateStore.update()` on server
- **Socket events**: Defined in `src/client/services/atoms/socket-types.ts` — add new events there first
