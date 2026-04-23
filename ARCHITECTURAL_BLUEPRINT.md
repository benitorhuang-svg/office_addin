# ARCHITECTURAL_BLUEPRINT: AI-Native Multi-Agent Nexus Architecture

## 1. 核心願景：軟體即 AI 團隊 (Software as a Collaborative AI Team)

本專案的核心目標是將傳統的 Office 增益集 (Add-in) 從單純的「工具箱」昇華為一個**「虛擬辦公室團隊」**。使用者不再是面對冰冷的功能選單，而是向一個由各領域專家（AI Agents）組成的團隊下達指令。

系統的運作邏輯仿照人類團隊協作：**理解任務 -> 制定計畫 -> 專家執行 -> 品質審核 -> 交付結果**。

---

## 2. 五大架構支柱 (The 5 Pillars)

本架構是多種經典與現代軟體設計哲學的完美融合，旨在平衡「開發靈活度」、「AI 系統穩定性」與「Token 消耗優化」。

### 2.1 🧠 圖編排與多智能體 (Multi-Agent Graph) - 【系統大腦】
*   **概念**：捨棄傳統的線性流程程式碼（Sequential Logic），改用「有向圖狀態機（Directed Acyclic Graph / State Machine）」。
*   **目的**：賦予 AI 「思考、執行、反思、糾錯」的迴圈能力。
*   **關鍵功能**：當 Agent 輸出錯誤時，系統能透過迴圈（Looping）自動修正，直到通過品質審核。

### 2.2 🔌 智能體垂直切片 (Agent-Centric Vertical Slices) - 【部門導向】
*   **概念**：將專案依據功能（如：Excel 數據分析、Word 文書撰寫、身份驗證）拆分為獨立的**垂直切片**。
*   **目的**：實現「極致解耦」。每個 Agent 部門都是獨立的插件（Plugin），新增功能只需掛載新插件，不影響現有結構。

### 2.3 🛡️ 六角架構與適配器 (Hexagonal Adapters) - 【環境隔離】
*   **概念**：將核心業務邏輯與外部依賴（如 Gemini API、Office SDK、Express 框架）徹底分離。
*   **目的**：保證系統具備「抗老化」與「秒換引擎」的能力。未來不論 AI 模型如何更迭，核心邏輯（Domain）均無需變動。

### 2.4 🛠️ 原子設計工具庫 (Atomic Tooling) - 【最小單元】
*   **概念**：在功能內部，將操作細分為 Atoms (原子)、Molecules (分子)、Organisms (有機體)。
*   **目的**：將複雜的 Office 操作解構為 AI 可以精準呼叫的「原子工具 (Tools)」。

### 2.5 📚 Agent Skill 三層設計原理 (Three-Tier Design Principle) - 【漸進式披露】
*   **概念**：基於 Anthropic 的漸進式披露（Progressive Disclosure）思想，將 Agent 的技能定義分為三層，避免一次性加載過多上下文。
*   **目的**：極致優化 Token 消耗，減少 LLM 的注意力干擾（Noise Reduction），並提高提示詞（Prompt）與邏輯指令的可維護性。
*   **具體實踐**：
    1.  **第一層 (Metadata Layer)**：動態從 TypeScript Tool Schema 提取簡短描述與參數，供 Orchestrator 進行輕量級意圖分類與工具索引。
    2.  **第二層 (Core Instructions / `SKILL.md`)**：當決定呼叫該專家時，才動態注入的瘦身版 Prompt，僅包含核心 Persona、行為準則與工具目錄。
    3.  **第三層 (Reference & Execution Layer)**：將具體領域知識（如圖表設計 SOP）放入 `references/` 資料夾，讓 LLM 在需要時透過內部工具按需讀取；並確保 Python 執行層純粹作為 JSON 到 Code 的確定性轉換器，不包含 LLM 猜測邏輯。

---

## 3. 專案目錄結構 (Project Blueprint)

```text
src/
├── 🌐 orchestrator/           # 【核心大腦】
│   ├── workflow-graph.ts      # 任務流轉邏輯 (Graph Builder)
│   ├── state-manager.ts       # 團隊共享狀態與上下文記憶 (Global State)
│   └── memory-service.ts      # 向量長期記憶管理 (ChromaDB 整合)
│
├── 🤖 agents/                 # 【專家團隊：垂直功能切片】
│   ├── router-agent/          # 總管：意圖識別、任務拆解與分派
│   ├── expert-excel/          # 數據專家：專精 Excel 公式與分析
│   │   ├── domain/            # 核心邏輯 (Atoms/Molecules) / 執行層 (Execution)
│   │   ├── prompts/           # 職責定義 (System Prompts) [Layer 2]
│   │   ├── references/        # 領域知識庫 (SOP, Guidelines) [Layer 3]
│   │   ├── index.ts           # Export Registry
│   │   └── excel.tools.ts     # 暴露給 AI 呼叫的原子工具與元數據 [Layer 1]
│   ├── expert-word/           # 文案專家：專精 Word 排版與寫作
│   └── qa-reviewer/           # 品管專家：負責輸出檢查與自我糾錯
│
├── 🛠️ tools/                  # 【工具箱：原子化實作庫】
│   ├── office-atoms/          # 操作 Office 的最小單元 (Read/Write/Style)
│   ├── web-search/            # 外部知識檢索工具
│   └── calculator/            # 數據運算工具
│
├── 🔌 adapters/               # 【六角適配器：對外接口實現】
│   ├── ai-providers/          # 適配 Gemini, Copilot SDK, GPT-4o
│   ├── office-host/           # 適配 Word, Excel, PowerPoint 宿主環境
│   └── vector-db/             # 適配 ChromaDB 向量資料庫
│
└── ⚙️ shared/                 # 【通用設施】
    ├── event-bus/             # 事件匯流排 (Agent 間異步通訊)
    └── logger/                # 系統日誌
```

---

## 4. 團隊協作工作流 (Collaboration Workflow)

當一個請求進來時，系統會經歷以下階段：

1.  **Ingress**: API 接入層接收請求。
2.  **Routing**: `router-agent` 僅使用 **Layer 1 (Metadata)** 分析意圖，判斷需要哪些專家介入。
3.  **Planning**: 在 `orchestrator` 中建立一個動態的任務圖 (Graph)。
4.  **Execution**: 
    *   動態注入被選中專家的 **Layer 2 (Core Instructions)**。
    *   專家在需要深入知識時，按需讀取 **Layer 3 (References)**。
    *   專家呼叫底層 **Execution Layer** (`office-atoms` 或 Python 腳本) 執行操作。
    *   數據回傳至 `orchestrator` 的 Shared Memory。
5.  **Review**: `qa-reviewer` 檢查分析結果是否正確。
    *   *若不正確*：標記錯誤點，返回 **Execution** 階段讓 AI 重做。
    *   *若正確*：推進至下一節點。
6.  **Egress**: 透過適配器將結果以 Streaming 形式回傳至前端介面。

---

## 5. 開發者指南 (Developer Guide)

### 如何新增一個 Agent？
1.  在 `src/agents/` 下建立新功能切片資料夾（如 `expert-ppt`）。
2.  在 `*.tools.ts` 定義 Agent 的 Schema 與元數據（Layer 1）。
3.  在 `prompts/` 下撰寫精簡版的 `System Prompt` 行為準則（Layer 2）。
4.  若有複雜的 SOP 或領域知識，放入 `references/` 供 Agent 按需讀取（Layer 3）。
5.  在 `domain/` 實作具體的執行邏輯或 Bridge Client。
6.  在 `src/agents/index.ts` 註冊該 Skill。

### 如何新增一個 Tool？
1.  在 `src/tools/` 下尋找對應的領域 (如 `office-atoms`)。
2.  開發一個符合系統標準介面的 TypeScript 函數。
3.  添加註釋說明（AI 依賴這些註釋來理解如何使用此工具）。

---

## 6. 總結

這套架構不僅僅是為了整理程式碼，更是為了**模擬一個高效能團隊的運作**。透過這套「大功能、中插件、小原子、邊界接口」的佈局，並輔以「Agent Skill 三層設計原理」的極致優化，您的專案將擁有無限的擴展潛力、極高的 AI 回應品質與最優化的 API 成本控管。