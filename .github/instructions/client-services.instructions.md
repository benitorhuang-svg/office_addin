---
applyTo: "src/client/services/**"
---

# src/client/services — Frontend Service Layer (Atomic Design)

Pure TypeScript services — no DOM manipulation here.
All services follow Atomic Design; organisms are the only layer that calls backend APIs.

## atoms/ — Primitive Services (zero dependencies on other service layers)
| File | Export | Use it when |
|------|--------|-------------|
| `api-client.ts` | `apiClient.get/post/stream()` | Low-level fetch wrapper for backend calls |
| `api-types.ts` | Request/response interfaces | Typing API calls |
| `socket-types.ts` | `SocketEvents` type map, `SYSTEM_STATE_UPDATED` payload | Adding new WebSocket events — **define here first** |
| `socket-config.ts` | `SOCKET_URL`, `socketOptions` | Socket.IO connection settings |
| `preset-manager.ts` | `PresetManager` | Client-side persona preset list |
| `prompt-template.ts` | `getPromptTemplate(id)` | Retrieve client-side prompt templates |
| `storage-provider.ts` | `storage.get/set/remove()` | LocalStorage wrapper with JSON serialization |
| `enums.ts` | Client-side enums | Shared enum values (Provider, Host, etc.) |
| `types.ts` | Client-side types | Type-only imports |
| `ui-types.ts` | UI-specific types | Component prop shapes |
| `crypto-provider.ts` | `generateNonce()` | Crypto utilities for auth flows |
| `locales.ts` | Locale string maps | i18n string keys |
| `slide-design-tokens.ts` | `SLIDE_TOKENS` | Design token constants for PPT slides |
| `layout-registry.ts` | `LayoutRegistry` | PPT slide layout registry |
| `provider-profiles.ts` | `PROVIDER_PROFILES` | Provider metadata (name, icon, capabilities) |

## molecules/ — Composed Services (can import atoms)
| File | Export | Use it when |
|------|--------|-------------|
| `global-state.ts` | `NexusStateStore` | **Central state store** — `update(patch)`, `subscribe(cb)`, `getState()` |
| `ActionHistory.ts` | `ActionHistory` singleton | Record user actions for Recap; `push()`, `getLast(n)`, `toPayload()` |
| `socket-service.ts` | `SocketService` | Socket.IO client — event routing, reconnect logic |
| `StreamEngine.ts` | `StreamEngine` | SSE stream reader — `read(response, onChunk)` |
| `conversation-manager.ts` | `ConversationManager` | Maintain chat message history |
| `excel-actions.ts` | `ExcelActions.*` | Excel JS API wrappers (read range, write cell, etc.) |
| `word-actions.ts` | `WordActions.*` | Word JS API wrappers (insert text, format, etc.) |
| `powerpoint-actions.ts` | `PowerPointActions.*` | PPT JS API wrappers (add slide, set title, etc.) |
| `office-actions.ts` | `OfficeActions.*` | Cross-host Office JS utilities |
| `auth-aggregator.ts` | `AuthAggregator` | Aggregate auth state from multiple providers |
| `DiagnosticEngine.ts` | `DiagnosticEngine` | Client-side diagnostics collection |
| `model-manager.ts` | `ModelManager` | Model selection state + available model list |
| `SessionManager.ts` | `SessionManager` | Session open/close lifecycle |
| `HistoryManager.ts` | `HistoryManager` | Chat history persistence (IndexedDB or localStorage) |
| `i18n-service.ts` | `t(key)` | Translate strings (en / zh-TW) |
| `WordIntegrator.ts` | `WordIntegrator` | High-level Word document operations |
| `circuit-breaker.ts` | `CircuitBreaker` | Prevent repeated failed API calls |
| `stream-decoder.ts` | `decodeStream()` | Decode chunked stream bytes to string |
| `ui-router.ts` | `UiRouter` | Hash-based client-side navigation |
| `ribbon-service.ts` | `RibbonService` | Office ribbon button state management |

## organisms/ — High-Level Orchestrators (can import anything)
| File | Export | Use it when |
|------|--------|-------------|
| `api-orchestrator.ts` | `sendToCopilot(payload)` | **Main send function** — builds request, streams response, updates state |
| `AppOrchestrator.ts` | `AppOrchestrator.boot()` | App initialization sequence, mounts all UI organisms |
| `chat-orchestrator.ts` | `ChatOrchestrator` | Manage chat session state + message lifecycle |
| `RenderManager.ts` | `RenderManager` | DOM render lifecycle (mount/unmount/update) |
| `StitchConnector.ts` | `StitchConnector` | Bridge Office ribbon commands → task pane actions |

## Key Rules
- **State mutations** always go through `NexusStateStore.update(patch)` — never assign `state.*` directly
- **New socket events** must be declared in `socket-types.ts` BEFORE implementing handlers
- `sendToCopilot()` is the ONLY entry point for backend API calls from UI components — do not use `apiClient` directly in components
- `ActionHistory.push()` must be called from `chat-orchestrator.ts` after each confirmed user action
- `ExcelActions`, `WordActions`, `PowerPointActions` are async and require `Office.context` to be ready
- `i18n-service.ts` supports `en` and `zh-TW` — add both translations simultaneously
