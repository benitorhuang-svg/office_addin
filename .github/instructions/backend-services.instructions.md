---
applyTo: "backend/services/**"
---

# backend/services — Business Services Layer

Provides stateful singletons and the full Copilot SDK integration.

## molecules/ — Shared State & Sockets
| File | Export | Use it when |
|------|--------|-------------|
| `nexus-socket.ts` | `NexusSocketRelay.broadcast(event, payload)` | Push any event to all connected task pane clients |
| `system-state-store.ts` | `GlobalSystemState` singleton | Read or update server-side state: `power`, `provider`, `isWarming`, `isStreaming`, `tokensPerSec`, `ttft`, `activePersona` |

> Always mutate state via `GlobalSystemState.update({ ... })`, never assign properties directly.

---

## copilot/atoms/ — SDK Configuration Primitives
| File | Export | Use it when |
|------|--------|-------------|
| `presets.ts` | `PRESETS`, `getPreset(id)` | Look up persona definition by preset ID |
| `prompt-template.ts` | `buildSystemPrompt(preset, context)` | Generate the system prompt string |
| `permission-policy.ts` | `getPermittedTools(preset)` | Get allowed tool list for a given preset |
| `tool-surface-policy.ts` | `getToolsForHost(host)` | Filter tools by Office host (`word`/`excel`/`ppt`) |
| `core-config.ts` | `buildClientConfig(token)` | Create `CopilotClient` config object |
| `types.ts` | Internal SDK types | Reference only |
| `formatters.ts` | `formatChunk()` | Normalize raw SDK chunk to string |
| `system-identity.ts` | `SYSTEM_IDENTITY` | Static identity metadata for the SDK session |

## copilot/molecules/ — SDK Turn Lifecycle
| File | Export | Use it when |
|------|--------|-------------|
| `sdk-turn-orchestrator.ts` | `runTurn(client, messages, tools, opts)` | Execute a single Copilot SDK turn with tool calls |
| `sdk-retry-engine.ts` | `withRetry(fn, opts)` | Wrap any async call with exponential backoff |
| `fallback-chain.ts` | `FallbackChain` | Attempt providers in order: Copilot → GitHub Models → Gemini |
| `client-manager.ts` | `ClientManager` | Pool and reuse `CopilotClient` instances |
| `tool-registry.ts` | `ToolRegistry` | Register/lookup Copilot tools dynamically |
| `option-resolver.ts` | `resolveOptions(req, defaults)` | Merge per-request options with global defaults |
| `adaptive-config.ts` | `AdaptiveConfig` | Hot-swap model config at runtime |
| `session-lifecycle.ts` | `onSessionOpen/Close` hooks | Lifecycle hooks for SDK session events |
| `response-parser.ts` | `parseResponse()` | Parse raw SDK response stream |
| `sse-parser.ts` | `parseSse()` | Parse Server-Sent Events from Gemini REST |
| `pending-input-queue.ts` | `PendingInputQueue` | Queue user inputs during active streaming |

## copilot/organisms/ — Provider Orchestrators
| File | Export | Use it when |
|------|--------|-------------|
| `completion-orchestrator.ts` | `getCompletion(req)` | **Entry point** — picks provider and delegates |
| `sdk-orchestrator-v2.ts` | `SdkOrchestratorV2` | GitHub Copilot SDK streaming path |
| `gemini-cli-orchestrator.ts` | `GeminiCliOrchestrator` | Gemini via local CLI bridge |
| `gemini-rest-service.ts` | `GeminiRestService` | Gemini via REST API fallback |
| `github-models-service.ts` | `GitHubModelsService` | Azure OpenAI-backed GitHub Models |
| `health-prober.ts` | `HealthProber` | Periodic provider health checks |

## copilot/tools/ — Copilot Tool Definitions
| Folder | File | Tool Name | Capability |
|--------|------|-----------|-----------|
| `core/` | `python-executor-tool.ts` | `run_python` | Execute Python in sandbox |
| `core/` | `google-search-tool.ts` | `google_search` | Web search results |
| `office/` | `excel-skill-tool.ts` | `excel_action` | Excel JS API actions |
| `office/` | `word-skill-tool.ts` | `word_action` | Word JS API actions |
| `office/` | `powerpoint-skill-tool.ts` | `ppt_action` | PowerPoint JS API actions |
| `office/` | `create-excel-chart-tool.ts` | `create_chart` | Insert chart into Excel |
| `index.ts` | — | `getSessionTools(host)` | Build tool list by Office host |

## Key Rules
- `getSessionTools('excel'|'word'|'powerpoint')` is the only correct way to build tool arrays — do not manually assemble
- Provider fallback order is defined in `fallback-chain.ts` — do not re-implement ordering elsewhere
- Tool definitions must satisfy `Tool<unknown>` from the Copilot SDK
