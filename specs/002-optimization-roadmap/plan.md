# 002 — 優化建議實作計畫 (Implementation Plan)

> **依賴規格**: `specs/002-optimization-roadmap/spec.md`

---

## Phase 1: 安全與穩定性 (P0)

### Task 1: Request Validator [P]
- **檔案**: `server/routes/atoms/request-validator.ts`
- **類型**: 新增 Atom
- **說明**: 建立 `validateCopilotRequest(body)` 純函式，驗證 `/api/copilot` 的 POST body
- **驗證**: prompt (required string ≤50000), authProvider (enum), model (optional string), streaming (optional boolean)
- **回傳**: `{valid: boolean, errors: string[]}`

### Task 2: Rate Limiter [P]
- **檔案**: `server/routes/molecules/rate-limiter.ts`
- **類型**: 新增 Molecule
- **說明**: Sliding window rate limiter Express middleware
- **設計**: `Map<string, {count, windowStart}>` per IP, 每分鐘視窗, 429 + Retry-After
- **Env**: `RATE_LIMIT_RPM=30`, `RATE_LIMIT_ENABLED=true`

### Task 3: Structured Logger [P]
- **檔案**: `server/atoms/request-logger.ts`
- **類型**: 新增 Atom
- **說明**: `createRequestLog()` 建立 request 追蹤物件, `logCompletion()` 記錄完成結果
- **格式**: JSON `{requestId, timestamp, authProvider, model, ip, latencyMs, status, error?}`

### Task 4: 整合 Validator + Logger 至 copilot-handler
- **檔案**: `server/routes/organisms/copilot-handler.ts`
- **類型**: 修改
- **依賴**: Task 1, Task 3
- **變更**:
  1. Import `validateCopilotRequest` 和 `createRequestLog`, `logCompletion`
  2. 在 `handleCopilotRequest` 開頭呼叫 validator，失敗回 400
  3. 建立 requestLog，請求完成時記錄

### Task 5: 整合 Rate Limiter 至 app-factory
- **檔案**: `server/molecules/app-factory.ts`
- **類型**: 修改
- **依賴**: Task 2
- **變更**: 在 apiRouter 掛載前加入 rate limiter middleware

---

## Phase 2: 系統韌性 (P1)

### Task 6: Adaptive Watchdog [P]
- **檔案**: `server/services/copilot/molecules/adaptive-watchdog.ts`
- **類型**: 新增 Molecule
- **說明**: 維護每個模型的延遲統計，動態計算超時值
- **核心**: `recordLatency()`, `getTimeout()`, `getStats()`
- **算法**: timeout = min(max(p95 * 2, 30000), 600000)

### Task 7: 整合 Adaptive Watchdog 至 SDK Orchestrator
- **檔案**: `server/services/copilot/organisms/sdk-orchestrator-v2.ts`
- **類型**: 修改
- **依賴**: Task 6
- **變更**: watchdog timer 改用 `AdaptiveWatchdog.getTimeout(model)`，完成後 `recordLatency()`

### Task 8: Idle Cleaner [P]
- **檔案**: `server/services/copilot/molecules/idle-cleaner.ts`
- **類型**: 新增 Molecule
- **說明**: 定期掃描閒置 client 並清理
- **Env**: `IDLE_CLEANUP_MINUTES=30`

### Task 9: 整合 Idle Cleaner 至 client-manager
- **檔案**: `server/services/copilot/molecules/client-manager.ts`
- **類型**: 修改
- **依賴**: Task 8
- **變更**: 新增 `lastActivity` timestamp 追蹤, 在既有 healthCheck 迴圈中加入閒置掃描

### Task 10: Fallback Chain [P]
- **檔案**: `server/services/copilot/molecules/fallback-chain.ts`
- **類型**: 新增 Molecule
- **說明**: 多模型降級鏈，依序嘗試直到成功
- **Env**: `FALLBACK_MODELS=gpt-5-mini,gemini-2.5-flash`

### Task 11: 整合 Fallback Chain 至 completion-service
- **檔案**: `server/services/copilot/organisms/completion-service.ts`
- **類型**: 修改
- **依賴**: Task 10
- **變更**: `execute()` 中包裝 FallbackChain，降級時在 response 標記 `fallbackModel`

---

## Phase 3: 設定更新

### Task 12: 更新 .env.example
- **檔案**: `.env.example`
- **類型**: 修改
- **說明**: 加入所有新增環境變數及註解

### Task 13: 更新 base-env.ts
- **檔案**: `server/config/atoms/base-env.ts`
- **類型**: 修改
- **說明**: 加入新環境變數的預設值讀取

### Task 14: 更新 server-config.ts
- **檔案**: `server/config/molecules/server-config.ts`
- **類型**: 修改
- **說明**: 匯出新的配置欄位
