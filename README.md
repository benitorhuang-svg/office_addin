# Nexus Center: 工業級 Office 全能智慧平台 (Omni-Office Zenith)

Nexus Center 是一套專為 **2026 年工業級研發與設計工作流** 打造的 Office 指令中心。它將 **Word, Excel 與 PowerPoint** 打通為一個統一的 **「戰略工作站 (Strategic Workstation)」** 。

---

## 🚀 核心優勢 (The Master Matrix)

### **1. 專家指令與分析角色 (Industrial Personas)**

系統採用 **Workflow-First + Expert Prompt** 策略：先用工程化流程技能約束執行，再注入各 Office 主機的大師級專家指令。

- **Word**：金字塔原理 (McKinsey) 與原子化寫作。
- **Excel**：數據與展現分離 (DLP)、**MMM 行銷數據科學家**、**策略預算顧問**。
- **PPT**：Bento Grid 排版邏輯與 10/20/30 原則。

### **2. 雙引擎工業武裝 (Dual-Engine Arsenal)**

- **Node.js 24 (中樞)**：負責 UI/UX Pro Max 的極致互動與指令調度。
- **Python 3.12 (武裝)**：透過 `uv` 優化，內置 `pandas`, `statsmodels`, `GalaxyGraph` 等精銳庫。

---

## 🐳 Docker 部署與執行 (The Zenith Container Era)

本專案採用 **2026 工業級雙引擎容器化架構**，確保在任何環境下都能展現極致穩定性與性能。

### **1. 快速部署 (Instant Deployment)**

確保已安裝 Docker 與 Docker Compose，然後執行：

```bash
taskkill /F /IM node.exe /T
npm run dev

# [推薦] 完全重置並重新構建全能引擎
docker-compose down; docker-compose up -d --build

# 即時日誌監控 (查看 AI Agent 啟動狀態)
docker-compose logs -f

# 停止服務
docker-compose stop
```

### **2. 容器技術規格 (The Nexus Standard)**

- **優化構建 (Turbo Build)**：採用 `uv` 作為 Python 套件管理工具，大幅縮短構建時間。
- **SSL 橋接**: 自動掛載本地 `office-addin-dev-certs` 至容器，提供 `https://localhost:4000` 存取。
- **Zenith 依賴標準**:
  - **零漏洞 (0 Vulnerabilities)**：通過 `npm audit` 嚴格過濾。
  - **零警示 (Clear logs)**：透過本地 Mock 隔離了過期套件（如 `keytar`, `domexception`）。
- **安全加固**: 使用非 root 的 `nexus` 使用者執行。

### **3. 存取入口**

- **後端與 Taskpane**: `https://localhost:4000`
- **日誌觀察**: `docker-compose logs -f`

---

## 🧬 Excel 專用分析角色 (Analytical Personas)

在 Excel 環境中，系統會根據任務動態啟動以下高階圖層：

1. **🧬 行銷數據科學家 (MMM 專家)**：
   - 專精於 **歸因分析**、**滯後效應 (Lag Effects)** 與 **品牌力評估**。
2. **💹 策略預算顧問 (Smart Budget Allocation)**：
   - 基於 **經濟飽和曲線 (Saturation Curve)** 原理提供預算分配建議。

---

## 🧪 架構亮點 (Architecture Highlights)

Nexus Center 採用了前瞻性的軟體工程實踐，確保系統的穩定性與可擴展性：

- **ACP 協議 (Agent Communication Protocol)**: 統一的智能體通訊標準，簡化了不同 AI 模型與 Office 主機之間的交互。
- **多智能體圖工作流 (Multi-Agent Graph Workflow)**: 基於圖論的任務調度，支援複雜的跨文件（Word/Excel/PPT）協作邏輯。
- **Workflow-First Skill Pack**: Excel / Word / PowerPoint expert skills 內建 `when-to-use`、`process`、`rationalizations`、`red-flags`、`verification` 結構化 metadata，讓 runtime 與 Copilot 都走同一套工程節奏。
- **斷路器 (Circuit Breaker)**: 內置彈性設計，當 AI 供應商或外部服務不穩定時，自動切換至降級模式，確保核心功能不中斷。
- **原子設計 (Atomic Design)**: 從 Atoms 到 Organisms 的層次化開發架構，極大化了代碼的重用性與測試覆蓋率。

## 🧭 Workflow-First Agent Skills

這個專案現在把 `agent-skills` 的思路直接落進兩個層次：

1. **產品 runtime**
   - `src/agents/expert-excel|word|ppt/` 的 expert skill 不再只是 prompt。
   - 每個 skill 都有結構化 workflow metadata，可被 registry、orchestrator、Office tools 直接注入。
   - `workflow-graph.ts` 與 `office-skill-tool.ts` 會傳遞 workflow guide，而不只是原始 prompt。

2. **Repo 開發流程**
   - `.github/skills/using-agent-skills/` 作為 meta-skill，先決定當前任務所處 phase，再套用對應 workflow。
   - `.github/skills/` 提供規劃、實作、測試、介面設計、安全與 review 技能。
   - `.github/agents/` 提供 code review、testing、security persona。
   - `.github/copilot-instructions.md` 改成短而可執行的 project rules。

### 核心原則

- **流程先於內容**：先決定怎麼做，再決定生成什麼。
- **反找藉口機制**：skill 直接攜帶 rationalization → reality 對照，降低 agent 跳過步驟的機率。
- **驗證不是附加品**：skill 本身就攜帶 verification checklist。
- **同一契約，多端共用**：expert skill metadata 同時服務 runtime、manifest、測試與 Copilot。

## 📊 Performance Tech Stack (2026 Edition)

- **Core**: TypeScript, Node.js (v24), Express (v5), Esbuild
- **Container**: Docker + UV (Python Management)
- **Intelligence**: Python 3.12 (FastAPI), **Prompt-Augmented Flagships**
- **Data Science**: NetworkX, Pandas, NumPy, Statsmodels
- **Aesthetics**: Pro-Max Glassmorphism, HUD System

## 📁 Project Layout

- `src/client/`: Office add-in UI, taskpane entrypoints, commands, and frontend services.
- `src/`: Express server, provider orchestration, routes, backend skills, and modular Copilot SDK tools (including Word / Excel / PowerPoint agent-callable skills).
- `shared/`: Shared types, enums, and locale primitives used across layers.
- `scripts/`: Operational tooling, with one-off cleanup utilities grouped under `scripts/maintenance/`.
- `specs/`: Architecture notes and local fixtures used by exploratory skills and manual testing.
- `reports/diagnostics/`: Archived lint and typecheck snapshots that should stay out of the project root.

---

_“Nexus isn’t just a tool; it’s an omniscient bridge between human intention and machine precision.”_
_Designed for the 2026 Industrial Era // Antigravity Agent Core._
