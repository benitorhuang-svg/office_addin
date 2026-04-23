---
applyTo: "backend/core/**"
---

# backend/core — Infrastructure Primitives

This layer provides zero-dependency infrastructure used by ALL other backend layers.
**Atomic Design rule**: atoms have no imports from molecules or organisms.

## atoms/ — Primitive Building Blocks
| File | Export | Use it when |
|------|--------|-------------|
| `logger.ts` | `logger` (pino instance) | Any server-side logging |
| `app-error.ts` | `AppError` class | Throwing typed HTTP errors (`new AppError(404, 'msg')`) |
| `latency-tracker.ts` | `LatencyTracker` | Measuring TTFT / request timing (`markStart/markEnd`) |
| `fetcher.ts` | `fetcher()` | Typed HTTP fetch wrapper with timeout |
| `client-ip.ts` | `getClientIp()` | Extract real IP behind proxies |
| `request-logger.ts` | middleware | Log every incoming request |

## molecules/ — Composed Infrastructure
| File | Export | Use it when |
|------|--------|-------------|
| `app-factory.ts` | `createApp()` | Bootstrap Express app with all middleware |
| `lifecycle-manager.ts` | `LifecycleManager` | Graceful shutdown hooks |
| `telemetry-middleware.ts` | middleware | Attach request-level timing to `res.locals` |
| `https-server-options.ts` | `getHttpsOptions()` | Load TLS certs for HTTPS server |

## organisms/ — Top-Level Wiring
| File | Export | Use it when |
|------|--------|-------------|
| `server-orchestrator.ts` | `ServerOrchestrator` | Start HTTP + HTTPS servers with lifecycle |

## Key Rules
- Import `logger` from `./atoms/logger.js` (not directly from pino)
- Never import from `routes/` or `services/` in this layer
- `AppError` is the only way to produce HTTP error responses — never `throw new Error()` in route handlers
