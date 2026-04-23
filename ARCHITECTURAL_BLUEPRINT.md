# ARCHITECTURAL_BLUEPRINT: AI-Native Multi-Agent Nexus Architecture (ACP-Enabled)

## 1. 核心願景：軟體即 AI 團隊 (Software as a Collaborative AI Team)

本專案的核心目標是將傳統的 Office 增益集 (Add-in) 昇華為一個**「虛擬辦公室團隊」**。本架構採用 **GitHub Copilot SDK ACP (Agent Communication Protocol)** 作為通訊骨幹，實現了 AI 智能體與 Office 環境的深度解耦與協作。

使用者不再是面對冰冷的功能選單，而是透過 ACP 連線向一個由各領域專家（AI Agents）組成的團隊下達指令。系統運作邏輯：**理解任務 -> 透過 ACP 分派 -> 專家執行 -> 品質審核 -> 交付結果**。

---

## 2. 六大架構支柱 (The 6 Pillars)

### 2.1 🧠 圖編排與多智能體 (Multi-Agent Graph) - 【系統大腦】
*   **概念**：捨棄傳統線性流程，改用「有向圖狀態機 (DAG)」。
*   **目的**：賦予 AI 「思考、執行、反思、糾錯」的迴圈能力。當 ACP 回傳的 Agent 輸出錯誤時，系統能自動修正。

### 2.2 📡 混合 AI 連接 (ACP Connectivity Layer) - 【通訊中樞】
*   **概念**：**GitHub Copilot SDK ACP** 是本架構的通訊核心，支援多種連線模式。
*   **目的**：實現「環境無關性」。不論是在 CLI 環境測試、連接 Azure 模型，還是透過 Gemini CLI 進行開發，核心業務邏輯均無需變更。
*   **連線模式**：
    *   `copilot_cli`: 原生 GitHub Copilot CLI 模式。
    *   `gemini_cli`: 透過 `bridge-orchestrator` 將 ACP 協議轉譯至 Gemini 生態。
    *   `azure_byok`: 企業級 Azure AI 整合模式。
    *   `remote_cli`: 跨進程/遠端 ACP 串接。

### 2.3 🔌 智能體垂直切片 (Agent-Centric Vertical Slices) - 【部門導向】
*   **概念**：將功能拆分為獨立的垂直切片（Excel 數據分析、Word 文書撰寫等）。
*   **目的**：每個 Agent 部門都是獨立的插件，新增功能只需掛載新插件，並自動透過 ACP 暴露給系統。

### 2.4 🛡️ 六角架構與 ACP 適配器 (Hexagonal ACP Adapters) - 【環境隔離】
*   **概念**：將核心邏輯與外部依賴（Gemini API、Office SDK）徹底分離。
*   **目的**：ACP 適配器層負責處理協議握手、串流解析 (SSE) 與錯誤重試，確保系統具備「抗老化」能力。

### 2.5 🛠️ 原子設計工具庫 (Atomic Tooling) - 【最小單元】
*   **概念**：將 Office 操作解構為 Atoms (原子)、Molecules (分子)、Organisms (有機體)。
*   **目的**：轉換為 AI 透過 ACP 可以精準呼叫的 `Tool Call` 定義。

### 2.6 📚 Agent Skill 三層設計原理 (Three-Tier Design) - 【漸進式披露】
*   **概念**：優化 Token 消耗，減少 LLM 的注意力干擾。
*   **具體實踐**：
    1.  **Metadata Layer**: 透過 TypeScript 提取 Tool Schema，供 ACP 進行初次分派。
    2.  **Core Instructions**: 選中專家後才動態注入的瘦身版 Prompt。
    3.  **Reference Layer**: 領域知識庫（如設計 SOP），在需要時按需讀取。

---

## 3. 專案目錄結構 (Project Blueprint)

```text
src/
├── 🌐 orchestrator/           # 【核心大腦】
│   ├── workflow-graph.ts      # 任務流轉邏輯 (Graph Builder)
│   ├── state-manager.ts       # 團隊共享狀態與上下文記憶
│   └── memory-service.ts      # 長期記憶 (ChromaDB)
│
├── 🤖 agents/                 # 【專家團隊：垂直功能切片】
│   ├── router-agent/          # 總管：意圖識別與 ACP 任務分派
│   ├── expert-excel/          # 數據專家：專精 Excel 公式與分析
│   └── qa-reviewer/           # 品管專家：負責輸出檢查與自我糾錯
│
├── 🔌 adapters/               # 【ACP 適配器：對外接口實現】
│   ├── ai-providers/          # 適配 Gemini (ACP v1), Copilot SDK (v2), GitHub Models
│   ├── office-host/           # 適配 Word, Excel, PPT 宿主環境
│   └── vector-db/             # 適配 ChromaDB 向量資料庫
│
├── ⚙️ config/                 # 【配置中心】
│   └── molecules/             # ACP 參數解析與驗證
│
└── ⚙️ shared/                 # 【通用基礎設施】
    ├── atoms/ai-core/         # ACP 協議定義與類型聲明
    └── molecules/ai-core/     # SDK Turn Orchestrator (ACP 生命週期管理)
```

---

## 4. 團隊協作工作流 (Collaboration Workflow)

1.  **Ingress**: 接收請求。
2.  **ACP Handshake**: 根據環境自動識別 ACP 連線方式（如偵測到 `--acp` 旗標）。
3.  **Routing**: `router-agent` 分析意圖，判斷需要哪些專家介入。
4.  **Planning**: 在 `orchestrator` 中建立動態任務圖。
5.  **ACP-Based Execution**: 
    *   動態注入專家的 Core Instructions。
    *   專家透過 ACP 呼叫底層 **Execution Layer** (`office-atoms` 或 Python 腳本)。
6.  **Review & Egress**: `qa-reviewer` 檢查後，透過 ACP 適配器將結果以 Streaming 形式回傳。

---

## 5. 開發者指南 (Developer Guide)

### 如何測試 ACP 連線？
*   **CLI 測試**: 使用 `npm run start:cli` 啟動，系統會自動偵測本地 ACP Port。
*   **Gemini 橋接**: 透過 `nexus.mjs` 啟動，它會封裝 `gemini-cli --acp` 以模擬 Copilot SDK 環境。
*   **除錯**: 查看 `src/infra/scripts/gemini-wrapper` 下的日誌，了解 ACP 協議包 (Protocol Packets) 的交換細節。

### 如何新增功能？
1.  在 `src/agents/` 建立 Skill。
2.  定義工具元數據（這將自動映射為 ACP Tool Definitions）。
3.  在 `adapters/ai-providers/` 確保連線參數符合目標 ACP 模式。
