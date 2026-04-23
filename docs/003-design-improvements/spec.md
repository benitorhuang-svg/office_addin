# 設計改良提案（Design Improvements）

> 參考來源：[Anthropic — Building Effective Agents](https://www.anthropic.com/research/building-effective-agents) ·
> [Anthropic — Prompting Best Practices](https://platform.claude.com/docs/en/docs/build-with-claude/prompt-engineering/system-prompts) ·
> [claude-cookbooks/patterns/agents](https://github.com/anthropics/claude-cookbooks/tree/main/patterns/agents)

---

## 一、專案目的

針對本 Office Add-in（Nexus Center）後端的 **Agent 架構、System Prompt 設計、Skill 路由** 三個維度，提出以 Anthropic 官方最佳實踐為依據的可操作改良方案。

---

## 二、當前架構快照

| 層 | 檔案 | 職責 |
|---|---|---|
| 入口 | `src/server.ts` | Express server 啟動 |
| 技能路由 | `src/agents/skills/skill-orchestrator.ts` | 關鍵字 if/else 路由到 excel/ppt/word/shared |
| 技能定義 | `src/agents/skills/skills-manifest.json` | 技能觸發條件與引擎對應 |
| 連線池 | `src/services/copilot/molecules/client-manager.ts` | Copilot SDK 連線管理 |
| 本地 agent | `src/infra/local-agent/index.mjs` | 獨立 agent 入口 |
| Shared skills | `src/agents/skills/shared/` | VectorNexus / GalaxyGraph / VisionExpert 等 |

**核心問題**：`SkillOrchestrator` 使用簡單 `q.includes()` 關鍵字匹配路由，屬於硬編碼 Workflow，缺乏 Anthropic 建議的語意路由與工具文件設計。

---

## 三、主要風險與痛點（原有）

- Config 無啟動前驗證，隱性錯誤難追蹤
- API 無 schema 驗證且無限流
- CORS 與 debug endpoint 在 production 未鎖定
- `ClientManager` 缺乏熔斷/背壓
- Skills 同進程執行可能阻塞主服務
- Session/state 儲存在記憶體，不利擴展
- 觀測/指標不完整

---

## 四、新增改良維度（基於 Anthropic 官方 2024-2026 最佳實踐）

### 4-A. System Prompt 重新設計

Anthropic 明確建議：**系統提示要像優秀的工作規範**，清楚定義角色、輸出格式、工具何時使用。

**當前問題**：`skills-manifest.json` 的 `prompt` 欄位指向外部 markdown 檔，但路由決策在 TypeScript 層以關鍵字完成，兩層解耦不一致。

**改良方向**：

```
<role>
You are Nexus, an intelligent Office Add-in assistant. You operate inside Microsoft Excel, Word, and PowerPoint.
</role>

<tool_use_policy>
Use ExcelExpert when the user references spreadsheets, formulas, data tables, or pivot analysis.
Use PPT-Master when the user references slides, decks, presentations, or visual layouts.
Use WordExpert when the user references documents, reports, or structured text editing.
Use VectorNexus for general semantic search questions about documentation.
Use GalaxyGraph when the user asks about relationships, impact, or "what breaks if I change X".
Use CrossHostBridge when the user wants to sync data across Office apps.
Only invoke one tool per turn unless tasks are truly independent and can run in parallel.
</tool_use_policy>

<default_to_action>
By default, implement changes rather than only suggesting them. If the user's intent is unclear,
infer the most useful likely action and proceed using tools to discover missing details.
</default_to_action>

<investigate_before_answering>
Never speculate about document content you have not read. Always read the active document context
before answering questions about its content.
</investigate_before_answering>
```

---

### 4-B. Skill 路由架構升級（Routing Workflow → LLM-based Routing）

Anthropic 推薦的 **Routing Workflow**：先用 LLM 分類 intent，再派送到專門的下游處理器。

**當前**：`skill-orchestrator.ts` 用 `q.includes("ppt")` 等關鍵字 → 容易漏掉語意相近的表達。

**建議升級**：

```typescript
// 新增 intent-classifier.ts (atoms 層)
// 用 Claude claude-haiku-4-5 做低成本路由分類
async classifyIntent(query: string): Promise<SkillDomain> {
  const response = await client.messages.create({
    model: "claude-haiku-4-5",  // 便宜快速，適合路由
    max_tokens: 64,
    system: "Classify the user query into one of: excel | ppt | word | vector_search | graph | vision | cross_app | unknown. Reply with only the label.",
    messages: [{ role: "user", content: query }]
  });
  return response.content[0].text.trim() as SkillDomain;
}
```

**參考模式**：Anthropic Cookbook `patterns/agents/basic_workflows.ipynb` — Routing section。

---

### 4-C. Orchestrator-Workers 模式（複雜多步任務）

當用戶請求涉及跨 Excel + PPT（例如：「把這份銷售資料做成投影片」），應使用 **Orchestrator-Workers** 模式。

```
用戶請求
    ↓
Orchestrator (claude-sonnet-4-6, effort=high)
    ├─ Worker A: ExcelExpert (讀取資料)
    └─ Worker B: PPT-Master (生成投影片)
    ↓
Synthesize results → 回傳用戶
```

此模式的 key 優勢：subtasks 不需預先定義，由 Orchestrator 根據 input 動態決定。

---

### 4-D. Evaluator-Optimizer 模式（輸出品質提升）

對於 PPT 設計、Word 文件生成等有明確品質標準的任務，加入評估迴圈：

```
Generate draft (PPT-Master)
    ↓
Evaluate (claude-haiku-4-5): 是否符合用戶風格要求？
    ↓  No
Refine → Regenerate
    ↓  Yes
Return final output
```

---

### 4-E. Tool/Skill 文件工程（ACI Design）

Anthropic 強調：**工具文件應與整體 prompt 同等重視**（ACI = Agent-Computer Interface）。

**改良 `skills-manifest.json` 格式**，為每個 skill 加入：

```json
{
  "ExcelExpert": {
    "trigger": "Industrial data manipulation and spreadsheet automation.",
    "logic": "Use when query involves 'Excel', 'spreadsheets', 'data analysis', or 'report generation'.",
    "example_inputs": [
      "Add a SUM formula to column D",
      "Create a pivot table from Sheet1",
      "Format all headers as bold"
    ],
    "example_outputs": "Returns VBA/Office.js script + brief explanation",
    "edge_cases": "If file path is not provided, ask user to specify the active workbook.",
    "input_format": "{ query: string, activeCell?: string, selectedRange?: string }"
  }
}
```

---

### 4-F. 平行工具呼叫最佳化

Anthropic 建議在 system prompt 中明確宣告平行工具呼叫策略：

```
<use_parallel_tool_calls>
If you intend to call multiple tools and there are no dependencies between them,
make all calls in parallel. For example, when reading Excel data AND checking PowerPoint
template simultaneously, run both tool calls at the same time.
</use_parallel_tool_calls>
```

---

### 4-G. 避免過度工程（Anti-Overeagerness）

Anthropic 明確指出 Claude 4.x 有「過度建立子 agent、過度路由」的傾向。在 system prompt 加入：

```
<subagent_policy>
Do not spawn subagents for work completable in a single response.
Spawn multiple subagents only when fanning out across independent workstreams
(e.g., reading Excel + generating PPT simultaneously).
</subagent_policy>
```

---

## 五、改良 PR 清單（完整版）

### 原有 P0（安全/穩定性）
- **PR-001**: `config-validation` — Zod schema 驗證 + fail-fast。估時 1–2 h
- **PR-002**: `api-validation-rate-limit` — AJV middleware + rate-limit。估時 2–4 h
- **PR-003**: `cors-debug-lock` — 收緊 CORS，保護 `/api/debug/*`。估時 1 h
- **PR-008**: `structured-logging` — JSON 結構化日誌 + request-id。估時 2 h

### 新增 P0（Prompt 設計）
- **PR-009**: `system-prompt-redesign` — 依 4-A 重寫 omni-bridge.md 等 skill prompts，加入 XML tag 結構。估時 2–4 h
- **PR-010**: `skills-manifest-aci` — 依 4-E 為每個 skill 補充 example_inputs/outputs/edge_cases。估時 2–3 h

### 原有 P1（架構穩定性）
- **PR-004**: `clientmanager-circuit-breaker` — concurrency limit + circuit-breaker。估時 1–2 天
- **PR-005**: `skills-worker-queue` — BullMQ/Redis worker 隔離。估時 1–3 天
- **PR-006**: `session-redis` — 狀態移到 Redis。估時 1–2 天

### 新增 P1（Agent 架構升級）
- **PR-011**: `llm-routing` — 依 4-B 以 claude-haiku 取代關鍵字路由。估時 4–8 h
- **PR-012**: `parallel-tools` — 依 4-F 在 system prompt + SDK 層啟用平行工具呼叫。估時 2–4 h
- **PR-013**: `orchestrator-workers` — 依 4-C 實作跨 app 複合任務的 Orchestrator 模式。估時 2–3 天
- **PR-014**: `evaluator-optimizer` — 依 4-D 為 PPT/Word 輸出加入品質評估迴圈。估時 1–2 天

### 原有 P2（可觀測性）
- **PR-007**: `observability` — OpenTelemetry + Prometheus + Sentry。估時 2–5 天

---

## 六、立即建議下一步

1. **最快見效**（1–4 小時）：PR-009（system prompt 重寫）+ PR-010（skill ACI 文件補強）→ 直接改善 AI 回答品質，零架構風險。
2. **安全性優先**：PR-001 → PR-002 → PR-003（P0 三件套）
3. **架構升級**：PR-011（LLM 路由）→ PR-013（Orchestrator-Workers）

---

## 更新記錄

| 版本 | 日期 | 說明 |
|---|---|---|
| v1.0 | 2026-04-22 | 初版（安全/穩定性改良） |
| v2.0 | 2026-04-22 | 新增 Anthropic 官方 Agent 最佳實踐維度（System Prompt 設計、LLM Routing、Orchestrator-Workers、ACI Tool Engineering） |

