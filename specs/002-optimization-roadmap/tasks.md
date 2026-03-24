# 002 — 任務清單 (Tasks)

> **依賴**: `specs/002-optimization-roadmap/plan.md`

---

## Parallel Group A — 新增獨立模組 [P]

可平行開發，無相互依賴：

- [ ] **Task 1**: 建立 `server/routes/atoms/request-validator.ts` — payload 驗證純函式
- [ ] **Task 2**: 建立 `server/routes/molecules/rate-limiter.ts` — 速率限制 middleware
- [ ] **Task 3**: 建立 `server/atoms/request-logger.ts` — 結構化日誌 atom
- [ ] **Task 6**: 建立 `server/services/copilot/molecules/adaptive-watchdog.ts` — 動態超時 molecule
- [ ] **Task 8**: 建立 `server/services/copilot/molecules/idle-cleaner.ts` — 閒置清理 molecule
- [ ] **Task 10**: 建立 `server/services/copilot/molecules/fallback-chain.ts` — 降級鏈 molecule

## Sequential Group B — 整合至既有模組

依賴 Group A 完成：

- [ ] **Task 4**: 修改 `copilot-handler.ts` — 整合 validator + logger（依賴 Task 1, 3）
- [ ] **Task 5**: 修改 `app-factory.ts` — 整合 rate limiter（依賴 Task 2）
- [ ] **Task 7**: 修改 `sdk-orchestrator-v2.ts` — 整合 adaptive watchdog（依賴 Task 6）
- [ ] **Task 9**: 修改 `client-manager.ts` — 整合 idle cleaner（依賴 Task 8）
- [ ] **Task 11**: 修改 `completion-service.ts` — 整合 fallback chain（依賴 Task 10）

## Sequential Group C — 設定更新

依賴 Group A + B 完成：

- [ ] **Task 12**: 更新 `.env.example` — 加入新環境變數
- [ ] **Task 13**: 更新 `base-env.ts` — 讀取新環境變數
- [ ] **Task 14**: 更新 `server-config.ts` — 匯出新配置欄位
