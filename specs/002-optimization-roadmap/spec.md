# 002 — 優化建議規格說明 (Optimization Roadmap Specification)

> **版本**: 1.0  
> **建立日期**: 2026-04-01  
> **狀態**: 🔄 規劃中  
> **依賴**: 001-current-architecture  
> **來源**: `project_optimization_roadmap.md`, `copilot_sdk_connection_methods/deepwiki-mapping.md`

---

## 1. 優化目標 (Optimization Goals)

基於 001 架構分析與既有的優化路線圖，本規格定義以下可執行的優化任務。 
**原則**：只實作已驗證需求的功能，不做推測性設計。

### 範圍界定
- ✅ **包含**：核心穩定性、資源管理、降級策略、安全強化
- ❌ **排除**：RAG 向量 DB（第二階段）、Knowledge Graph（需獨立 spec）、Office 深度整合（右鍵選單等、第三階段）

---

## 2. 使用者故事 (User Stories)

### US-001: 智慧型活動監視器 (Adaptive Watchdog)
**作為** 系統管理者，**我需要** SDK 根據不同模型的延遲特性自動調整超時閾值，**以便** 避免大型模型回應被過早中斷或小型模型的無效等待。

**驗收標準：**
- [ ] 不同模型維護各自的延遲統計（P50/P95/P99）
- [ ] 超時閾值基於歷史延遲動態調整（而非固定 300s）
- [ ] 首次使用模型時，使用保守的預設超時值
- [ ] 延遲統計持久化於記憶體（無需 DB）

### US-002: 資源自動回收 (Idle Cleanup)
**作為** 伺服器營運者，**我需要** 閒置超過一定時間的 SDK 進程自動關閉，**以便** 降低記憶體佔用和避免 zombie process。

**驗收標準：**
- [ ] client 閒置 30 分鐘（可設定）後自動清理
- [ ] 清理前檢查是否有 pending sessions
- [ ] 清理動作記錄至 log（含關閉原因與資源使用統計）
- [ ] 不影響正在進行的對話 session

### US-003: 多模型降級策略 (Multi-Model Fallback)
**作為** 使用者，**我需要** 主要模型失敗時系統自動嘗試備用模型，**以便** 減少服務中斷。

**驗收標準：**
- [ ] 定義模型優先順序（configurable via env）
- [ ] 主模型失敗（timeout/error）後自動切換至下一個可用模型
- [ ] 降級發生時前端顯示提示（使用的備用模型名稱）
- [ ] 記錄降級事件（原始模型、錯誤原因、降級目標）

### US-004: 請求速率限制 (Rate Limiting)
**作為** 系統管理者，**我需要** API 端點有基本的速率限制，**以便** 防止濫用並保護後端服務。

**驗收標準：**
- [ ] `/api/copilot` 端點：每 IP 每分鐘最多 30 次請求
- [ ] 超過限制回傳 429 + `Retry-After` header
- [ ] 速率限制數值可透過環境變數設定
- [ ] 使用 in-memory store（不依賴外部 Redis）

### US-005: Payload Schema 驗證 (Request Validation)
**作為** 開發者，**我需要** API 請求 payload 經過 schema 驗證，**以便** 在入口處攔截無效請求，避免深層錯誤。

**驗收標準：**
- [ ] `/api/copilot` POST body 驗證：`prompt` (required string), `model` (optional string), `authProvider` (enum), `streaming` (optional boolean)
- [ ] 驗證失敗回傳 400 + 明確的欄位錯誤訊息
- [ ] 不引入外部 schema 驗證庫（使用 TypeScript 型別守衛）

### US-006: 結構化日誌 (Structured Logging)
**作為** 開發者，**我需要** 所有 AI 請求產生結構化日誌（含 requestId、model、latency、status），**以便** 排查問題和衡量效能。

**驗收標準：**
- [ ] 每個請求分配 unique `requestId`（UUID v4）
- [ ] 記錄：`{requestId, authProvider, model, latencyMs, status, chunks, error?}`
- [ ] console.log JSON 格式輸出（production-ready）
- [ ] 延遲追蹤整合既有的 `latency-tracker.ts`

---

## 3. 技術設計 (Technical Design)

### 3.1 智慧型活動監視器 (Adaptive Watchdog)

**位置**: `server/services/copilot/molecules/adaptive-watchdog.ts`

```
原子化層級: Molecule（組合 core-config atom + latency-tracker atom）

介面設計:
  class AdaptiveWatchdog {
    recordLatency(model: string, latencyMs: number): void
    getTimeout(model: string): number        // 回傳動態超時值
    getStats(model: string): LatencyStats    // P50/P95/P99
  }

  interface LatencyStats {
    count: number
    p50: number
    p95: number
    p99: number
    lastUpdated: number
  }
```

**整合點**: `sdk-orchestrator-v2.ts` 中的 watchdog timer 改用動態超時值。

### 3.2 資源自動回收 (Idle Cleanup)

**位置**: `server/services/copilot/molecules/idle-cleaner.ts`

```
原子化層級: Molecule（組合 client-manager atom 的 TTL 機制）

擴展 client-manager.ts:
  - 新增 lastActivityTimestamp per client
  - 定期掃描（每 5 分鐘）閒置 client
  - 閒置閾值: IDLE_CLEANUP_MINUTES env, default 30
  - 清理前檢查 activeSessionCount > 0 → skip
```

**整合點**: 擴展既有 `client-manager.ts` 的 5 分鐘健康檢查迴圈。

### 3.3 多模型降級策略 (Multi-Model Fallback)

**位置**: `server/services/copilot/molecules/fallback-chain.ts`

```
原子化層級: Molecule

介面設計:
  class FallbackChain {
    constructor(models: string[])           // e.g. ['gpt-5-mini', 'gemini-2.5-flash']
    async execute(fn: (model: string) => Promise<T>): Promise<{result: T, model: string, fallbackUsed: boolean}>
  }

環境變數:
  FALLBACK_MODELS=gpt-5-mini,gemini-2.5-flash  (逗號分隔)
```

**整合點**: `completion-service.ts` 的 `execute()` 方法包裝 FallbackChain。

### 3.4 請求速率限制 (Rate Limiting)

**位置**: `server/routes/molecules/rate-limiter.ts`

```
原子化層級: Molecule

設計:
  - Sliding window counter per IP (Map<string, {count, windowStart}>)
  - 每分鐘視窗 (configurable)
  - Express middleware factory

環境變數:
  RATE_LIMIT_RPM=30         (requests per minute)
  RATE_LIMIT_ENABLED=true   (feature flag)
```

**整合點**: `app-factory.ts` 中掛載於 `/api/copilot` 路由前。

### 3.5 Payload Schema 驗證 (Request Validation)

**位置**: `server/routes/atoms/request-validator.ts`

```
原子化層級: Atom（純函式，無依賴）

設計:
  function validateCopilotRequest(body: unknown): {valid: boolean, errors: string[]}
  - 檢查 prompt: required, string, maxLength 50000
  - 檢查 authProvider: enum value
  - 檢查 model: optional, string
  - 檢查 streaming: optional, boolean
```

**整合點**: `copilot-handler.ts` 在處理請求前呼叫驗證。

### 3.6 結構化日誌 (Structured Logging)

**位置**: `server/atoms/request-logger.ts`

```
原子化層級: Atom（純函式）

設計:
  function createRequestLog(req: Request): RequestLog
  function logCompletion(log: RequestLog, result: CompletionResult): void

  interface RequestLog {
    requestId: string     // crypto.randomUUID()
    timestamp: string     // ISO 8601
    authProvider: string
    model: string
    ip: string
  }
```

**整合點**: `copilot-handler.ts` 在請求開始和結束時呼叫。

---

## 4. 實作計畫 (Implementation Plan)

### Phase 1: 安全與穩定性（P0）

| 任務 | 檔案 | 類型 | 依賴 |
|------|------|------|------|
| 4.1 Request Validator | `server/routes/atoms/request-validator.ts` | 新增 Atom | 無 |
| 4.2 Rate Limiter | `server/routes/molecules/rate-limiter.ts` | 新增 Molecule | 無 |
| 4.3 Structured Logger | `server/atoms/request-logger.ts` | 新增 Atom | 無 |
| 4.4 整合至 copilot-handler | `server/routes/organisms/copilot-handler.ts` | 修改 | 4.1, 4.3 |
| 4.5 整合至 app-factory | `server/molecules/app-factory.ts` | 修改 | 4.2 |

### Phase 2: 系統韌性（P1）

| 任務 | 檔案 | 類型 | 依賴 |
|------|------|------|------|
| 4.6 Adaptive Watchdog | `server/services/copilot/molecules/adaptive-watchdog.ts` | 新增 Molecule | 無 |
| 4.7 整合至 SDK Orchestrator | `server/services/copilot/organisms/sdk-orchestrator-v2.ts` | 修改 | 4.6 |
| 4.8 Idle Cleaner | `server/services/copilot/molecules/idle-cleaner.ts` | 新增 Molecule | 無 |
| 4.9 整合至 client-manager | `server/services/copilot/molecules/client-manager.ts` | 修改 | 4.8 |
| 4.10 Fallback Chain | `server/services/copilot/molecules/fallback-chain.ts` | 新增 Molecule | 無 |
| 4.11 整合至 completion-service | `server/services/copilot/organisms/completion-service.ts` | 修改 | 4.10 |

---

## 5. 檢查清單 (Checklist)

### Requirement Completeness
- [x] 所有 US 都有明確的驗收標準
- [x] 無 [NEEDS CLARIFICATION] 標記
- [x] 需求可測試且無歧義
- [x] 成功標準可量測

### Simplicity Gate
- [x] 未引入外部依賴（全部使用原生 Node.js API）
- [x] 無推測性功能
- [x] 每個新模組職責單一

### Anti-Abstraction Gate
- [x] 直接使用 Express middleware 機制
- [x] 直接使用 Map/Set 資料結構（不包裝通用 Cache 抽象）
- [x] 無過度的 interface 層

### Integration Points
- [x] 所有新模組都有明確的整合位置
- [x] 不破壞既有 API 契約
- [x] 環境變數有預設值（向後相容）

---

## 6. 環境變數新增 (New Environment Variables)

| 變數名稱 | 預設值 | 說明 |
|----------|--------|------|
| `IDLE_CLEANUP_MINUTES` | `30` | Client 閒置自動清理時間（分鐘） |
| `RATE_LIMIT_RPM` | `30` | 每 IP 每分鐘最大請求數 |
| `RATE_LIMIT_ENABLED` | `true` | 是否啟用速率限制 |
| `FALLBACK_MODELS` | _(empty)_ | 降級模型清單（逗號分隔，空值 = 不啟用降級） |
| `LOG_FORMAT` | `json` | 日誌格式（`json` / `text`） |
