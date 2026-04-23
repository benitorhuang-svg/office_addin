---
applyTo: "src/routes/**"
---

# src/routes — HTTP API Layer

Handles all incoming HTTP requests, validation, rate limiting, and auth flows.

## atoms/ — Request Primitives
| File | Export | Use it when |
|------|--------|-------------|
| `request-validator.ts` | `validateBody(schema)` middleware | Validate request body with Zod schema at route entry |
| `status-html.ts` | `renderStatusHtml()` | Generate `/status` page HTML |

## molecules/ — Route Middleware
| File | Export | Use it when |
|------|--------|-------------|
| `rate-limiter.ts` | `apiRateLimiter`, `authRateLimiter` | Apply per-IP rate limits on API / auth routes |
| `session-store.ts` | `sessionMiddleware` | Configure express-session with Redis or memory store |

## organisms/ — Route Handlers
| File | Route | Responsibility |
|------|-------|---------------|
| `api-router.ts` | `/api/*` | Mounts all API sub-routes |
| `auth-router.ts` | `/auth/*` | OAuth callback, token exchange |
| `copilot-handler.ts` | `POST /api/chat` | **Core handler** — streams Copilot responses, tracks TTFT + tokens/sec, broadcasts `SYSTEM_STATE_UPDATED` |
| `oauth-service.ts` | — | OAuth token refresh & GitHub App flow |

## Critical: copilot-handler.ts
- Reads `presetId` from body → used as `activePersona`
- `onChunk` callback: first token → records TTFT via `LatencyTracker.markEnd()`
- After stream: computes `tokensPerSec = Math.round((chunkCount * 8) / elapsedSec)`
- Broadcasts via `NexusSocketRelay.broadcast('SYSTEM_STATE_UPDATED', { tokensPerSec, ttft, activePersona })`

## Key Rules
- Always call `validateBody()` before accessing `req.body` in any route
- Rate limiters must be applied before auth middleware
- Never call `SystemStateStore` directly from atoms or molecules — only from organisms
