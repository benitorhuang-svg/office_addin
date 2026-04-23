---
applyTo: "src/client/components/**"
---

# src/client/components — UI Component Library (Atomic Design)

All components are pure DOM factories — no framework, no virtual DOM.
Every factory function returns an `HTMLElement` and is prefixed `create*`.

## atoms/ — Primitive UI Elements (zero dependencies)
| File | Factory | Returns |
|------|---------|---------|
| `Button.ts` | `createButton(label, onClick)` | `<button>` |
| `Input.ts` | `createInput(placeholder, onChange)` | `<input>` |
| `LayoutBox.ts` | `createLayoutBox(opts)` | `<div>` flex/grid container |
| `NexusCard.ts` | `createNexusCard(opts)` | Styled card `<div>` |
| `Typography.ts` | `createTypography(text, variant)` | `<p>/<h1-h6>/<span>` |
| `Icon.ts` | `createIcon(name)` | SVG icon `<span>` |
| `FluentButton.ts` | `createFluentButton(opts)` | Fluent UI-styled button |
| `FluentInput.ts` | `createFluentInput(opts)` | Fluent UI-styled input |
| `Divider.ts` | `createDivider()` | `<hr>` separator |
| `status-badge.ts` | `createStatusBadge(status)` | Colored status pill |
| `status-dot.ts` | `createStatusDot(status)` | Pulse dot indicator |
| `status-icon.ts` | `createStatusIcon(status)` | Icon for status state |
| `StepItem.ts` | `createStepItem(step, opts)` | Single step in stepper |

## molecules/ — Composed Components (can import atoms)
| File | Factory | Purpose |
|------|---------|---------|
| `StatusHUD.ts` | `createStatusHUD()` | Live telemetry bar: `⚡ t/s`, `🧠 TTFT`, `🤖 persona` — subscribes to `NexusStateStore` |
| `ZenithInsightButton.ts` | `createZenithInsightButton()` | Floating FAB (bottom-right) with insight/recap mini-menu |
| `ZenithInsightCard.ts` | `createZenithInsightCard({ mode, onClose })` | HUD overlay card showing insight or recap result |
| `chat-bubble.ts` | `createChatBubble(msg)` | Single chat message (user or assistant) |
| `model-selector.ts` | `createModelSelector(opts)` | Model/provider dropdown |
| `auth-card.ts` | `createAuthCard(opts)` | Auth UI card |
| `context-manager.ts` | `createContextManager(opts)` | Document context display |
| `task-stepper.ts` | `createTaskStepper(steps)` | Multi-step progress indicator |
| `suggestion-cards.ts` | `createSuggestionCards(prompts)` | Quick-prompt chips |
| `prompt-group.ts` | `createPromptGroup(group)` | Grouped prompt template panel |
| `activity-log.ts` | `createActivityLog()` | Action log list |
| `expert-hub.ts` | `createExpertHub(personas)` | Expert persona selector |
| `Toast.ts` | `createToast(msg, type)` | Notification toast (auto-dismiss) |
| `StatusHub.ts` | `createStatusHub()` | Provider/model status hub |
| `typing-indicator.ts` | `createTypingIndicator()` | Animated "…" bubble |
| `welcome-message.ts` | `createWelcomeMessage()` | First-run welcome panel |

## organisms/ — Page-Level Sections (can import anything)
| File | Factory | Purpose |
|------|---------|---------|
| `MainChatOrganism.ts` | `createMainChat(opts)` | Full chat panel — mounts all molecules + appends `ZenithInsightButton` FAB to `document.body` |
| `PromptOrganism.ts` | `createPromptArea(opts)` | Prompt input + send button area |
| `AuthGateway.ts` | `createAuthGateway(opts)` | Auth gate wrapper — shown before chat if not authenticated |
| `header.ts` | `createHeader(opts)` | App header with logo + model selector |
| `history-container.ts` | `createHistoryContainer()` | Scrollable chat history wrapper |
| `monitor.ts` | `createMonitor(opts)` | Monitor panel (telemetry + diagnostics) |

## Key Rules
- Atoms must NOT import from molecules or organisms
- Molecules must NOT import from organisms
- `ZenithInsightButton` is mounted by `MainChatOrganism` — do NOT mount it anywhere else
- `StatusHUD` updates itself reactively via `NexusStateStore.subscribe()` — never push updates manually
- All `create*` factories must return a single root `HTMLElement`
- `ZenithInsightCard` mode `'recap'` calls `ActionHistory.toPayload()` for session history
