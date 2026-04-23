# 🌺 Huashu Design (花叔設計技能) 專案分析與整合建議

## 🔗 專案資源
*   **GitHub Repository:** [https://github.com/alchaincyf/huashu-design](https://github.com/alchaincyf/huashu-design)
*   **作者:** alchaincyf (花叔 / Huashu)
*   **類型:** AI Agent 技能 (Skill) 框架與 Prompt 集合

---

## 📖 關於 Huashu Design 專案

`huashu-design` 在 AI 開源社群中是一個極具影響力的「設計力 (Design Skill)」框架，專為現代 AI Agent（如 Claude Code, Gemini CLI）打造。它的核心理念是不僅讓 AI 產出「功能性」的結果，更要賦予 AI **「大師級的視覺與架構靈魂」**。

### 核心亮點 (Core Features)

1.  **大師級設計哲學 (20 Design Philosophies)**
    內建了 20 種世界頂級的設計思維（例如：原研哉的極簡主義、Pentagram 的幾何結構、Apple 的無縫過渡等）。AI 在生成前端代碼或文件排版時，會被強制戴上這些「大師濾鏡」。
2.  **5 維度專家評審機制 (5-Dimension Review)**
    AI 在給出最終產出前，會先進入內部的「專家委員會 (Expert Panel)」進行自我批判。評分維度包含：資訊架構、視覺詩意 (Visual Poetry)、情感共鳴、可用性與品牌一致性。
3.  **品牌智能 (Brand Intelligence)**
    具備強大的品牌色彩與資產萃取能力。AI 不會隨機猜測配色，而是能從指定的 Logo 或官方網站中，精準提取主色調、輔助色與字體氛圍，並應用於生成的設計中。
4.  **高保真輸出 (High-Fidelity Output)**
    擅長透過終端提示 (Terminal Prompt) 直接生成高保真的 iOS 原型 (HTML/CSS)、微動畫 (Micro-interactions) 以及可編輯的 PowerPoint (PPTX) 結構。

---

## 🚀 對本專案 (GitHub Copilot SDK Add-in) 的優化建議

我們目前的 Node.js Orchestrator + Python 專家引擎 + Office.js 架構，已經具備了承載 `huashu-design` 進階思維的完美體質。我們不需要照抄原始碼，而是應該**「萃取其設計 DNA」**，將其思想注入我們的 Nexus 系統中，對現有架構進行「降維打擊」式的升級。

以下是具體的整合與優化建議：

### 1. 簡報生成升級：大師級簡報引擎 (PPT-Master)
*   **現狀:** 我們已有 `src/agents/skills/parts/ppt/ppt_expert.py` 與前端的 `Slide Factory V9`，能根據文本生成投影片並套用基礎的 Design Tokens。
*   **優化建議:**
    *   將 Huashu 的「20 種設計哲學 Prompt」整合進 `src/agents/skills/parts/ppt/prompts/ppt-master.md`。
    *   當使用者輸入「幫我把這份財報做成投影片，要有蘋果發佈會的極簡風格」時，`PPT-Master` 技能不僅是決定大綱，還能精確計算出符合該哲學的留白比例 (Whitespace)、無襯線字體大小與高對比色配置，再交由 Office.js 渲染出令人驚豔的企業級簡報。

### 2. 引入多 Agent 審查機制：5 維度內容品管 (5-Dimension Review)
*   **現狀:** AI (如 `WordExpert` 或 `ExcelExpert`) 產生內容後，通常直接透過 Socket 回傳給前端 Taskpane。
*   **優化建議:**
    *   在 `src/agents/skills/skill-orchestrator.ts` 中，建立一個隱藏的 `DesignReviewer` Agent 節點。
    *   當專家引擎 (Expert) 產出 Word 企劃案初稿或 Excel 圖表配置後，先交由 `DesignReviewer` 從「資訊架構、專業語氣、視覺詩意」等維度打分。如果低於門檻，則要求 Expert 自動重寫。
    *   確保最終呈現在 Office 文件上的，永遠是經過 AI 內部千錘百鍊的高品質內容。

### 3. 動態樣式注入：品牌智能萃取 (Brand Intelligence)
*   **現狀:** 前端的樣式 (Design Tokens) 目前定義在 `src/client/styles/tokens/nexus-tokens.css` 與 `atoms/slide-design-tokens.ts` 中。
*   **優化建議:**
    *   利用我們規劃中的 `vision_expert.py` (視覺大師)。
    *   允許使用者在 Taskpane 提供公司網址或上傳 Logo。`vision_expert.py` 瞬間萃取品牌主色調與輔助色，並動態生成覆寫 (Override) 的 CSS 變數與 PPT Design Tokens。
    *   接下來 AI 在 Excel 生成的圖表 (Charts) 或 PPT 的標題顏色，將自動無縫對齊使用者的企業 CI (Corporate Identity)。

### 4. Taskpane 視覺進化：HTML-Native 微動畫體驗
*   **現狀:** 我們剛完成了前端 `src/client/styles/` 的 Atomic Design 重構，結構清晰。
*   **優化建議:**
    *   吸收 Huashu 對高保真 UI/UX 的追求，進一步豐富 `src/client/styles/atoms/animations.css` 與 `src/client/styles/molecules/chat-bubbles.css`。
    *   加入如玻璃擬物化 (Glassmorphism)、流暢的對話氣泡展開動畫，以及具有未來感的「思考中」骨架屏 (Skeleton Loading)。
    *   當背景的 Python 引擎在進行重度運算時，前端呈現的是 Nexus 動態光影，讓這個 Add-in 不只是一個文字工具，更像是一個次世代的魔法神器。

---

## 🎯 總結

`huashu-design` 的價值在於其**「讓 AI 擁有審美觀」**的 Prompt 工程與架構設計。結合我們專案中強大的跨應用程式橋接能力 (Cross-Host Bridge) 與本機 Python 運算引擎，我們完全有能力打造出一個超越市面上現有 AI Add-in 競品、真正具備「首席設計師與分析師」靈魂的企業級 Copilot 解決方案。