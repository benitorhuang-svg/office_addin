# Nexus Center: 工業級 Office 全能智慧平台 (Omni-Office Zenith)

Nexus Center 是一套專為 **2026 年工業級研發與設計工作流** 打造的 Office 指令中心。它將 **Word, Excel 與 PowerPoint** 打通為一個統一的 **「戰略工作站 (Strategic Workstation)」** 。

---

## 🚀 核心優勢 (The Master Matrix)

### **1. 專家指令與分析角色 (Industrial Personas)**

系統採用 **指令先行 (Prompt-First)** 策略，注入大師級指令塊。

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

## 📊 Performance Tech Stack (2026 Edition)

- **Core**: TypeScript, Node.js (v24), Express (v5), Esbuild
- **Container**: Docker + UV (Python Management)
- **Intelligence**: Python 3.12 (FastAPI), **Prompt-Augmented Flagships**
- **Data Science**: NetworkX, Pandas, NumPy, Statsmodels
- **Aesthetics**: Pro-Max Glassmorphism, HUD System

## 📁 Project Layout

- `client/`: Office add-in UI, taskpane entrypoints, commands, and frontend services.
- `backend/`: Express server, provider orchestration, routes, backend skills, and modular Copilot SDK tools (including Word / Excel / PowerPoint agent-callable skills).
- `shared/`: Shared types, enums, and locale primitives used across layers.
- `scripts/`: Operational tooling, with one-off cleanup utilities grouped under `scripts/maintenance/`.
- `specs/`: Architecture notes and local fixtures used by exploratory skills and manual testing.
- `reports/diagnostics/`: Archived lint and typecheck snapshots that should stay out of the project root.

---

_“Nexus isn’t just a tool; it’s an omniscient bridge between human intention and machine precision.”_
_Designed for the 2026 Industrial Era // Antigravity Agent Core._
