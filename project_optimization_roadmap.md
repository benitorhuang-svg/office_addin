# 專案優化與功能擴展藍圖 (Project Optimization Roadmap)

本文件盤點了 `Github_Copilot_SDK_addin` 專案的所有優化建議，並根據實作進度進行分類與規劃。

---

## 🛠️ 第一階段：核心穩定性與基礎 UX (已完成/進行中)

### 1. 系統穩定性 (Backend & SDK)
*   [x] **環境變數嚴格驗證 (Config Validator)**：啟動時檢查 API Token、Port 與模型設定。
*   [x] **SDK 併發併發控制 (Race Condition Fix)**：防止多個請求同時啟動背景 Client。
*   [ ] **智慧型活動監視器 (Adaptive Watchdog)**：針對不同模型的延遲特性調整超時閾值。
*   [ ] **資源自動回收 (Idle Cleanup)**：閒置一段時間後自動關閉 SDK 進程。

### 2. 基礎使用者體驗 (Frontend)
*   [x] **對話紀錄持久化 (Conversation Persistence)**：利用 `localStorage` 儲存最近 10 次對話。
*   [x] **互動式提問強項 (Rich UI Ask User)**：支援下拉選單 (Select) 與多選 (Checkbox)。
*   [x] **錯誤復原機制 (Retry Logic)**：在氣泡內直接提供「重新傳送」按鈕。
*   [x] **組件原子化 (Atomic Design Refinement)**：將按鈕、表單等 UI 元件拆分為 Atom。

---

## 📚 第二階段：RAG 檢索增強生成 (規劃中)

RAG 適合解決長文件上下文長度限制 (Context Window) 與外部文件的引用需求。

### 1. 長文件分段 (Chunking Molecule)
*   **功能**：將 Word 超長全文依據段落或字數進行切片，避免 Token 浪費。
*   **技術**：使用 `RecursiveCharacterTextSplitter` 類似邏輯進行語義切割。

### 2. 輕量向量存儲 (VectorStore Molecule)
*   **技術選型**：使用 `hnswlib-js` (in-memory) 或 WebSQL/IndexedDB 在瀏覽器端進行快取。
*   **功能**：將使用者問題向量化，並從文件中檢索最相關的前 3-5 個片段。

### 3. 多文件參照功能 (Multi-Doc Bridge)
*   **功能**：允許使用者上傳或選取多份本地文件（如 PDF/Docx）作為對話背景。
*   **架構**：後端新增 `FileAnalyzer` 組件處理向量化與持久化。

---

## 📑 第三階段：Office 深度功能整合 (規劃中)

提升 AI 在 Word 內部的「生產力」與「流程自動化」。

### 1. 智慧範本填寫 (Template Filling)
*   **場景**：自動偵測文件中的佔位符（如 `[ClientName]`, `{{Date}}`），並根據對話與 RAG 資訊自動填入。
*   **優勢**：降低重複性文書工作。

### 2. 情境感知大綱 (Heading Context)
*   **優化**：不只讀取文字，更讀取文件大綱結構。
*   **新功能**：一鍵生成「完整章節規劃」或「摘要當前章節」。

### 3. 右鍵選單與 Office 事件 (Deep Integration)
*   **ContextMenu (右鍵選單)**：選取文字後，右鍵選單直接顯示「翻譯」、「改寫」、「摘要」。
*   **追蹤修訂整合**：AI 的修改建議可以以「註解」方式呈現，不強制覆蓋原文。

---

## 📈 優先順序建議 (Priority Matrix)

| 優先級 | 項目 | 預估工時 | 核心價值 |
| :--- | :--- | :---: | :--- |
| **P0** | 完成併發控制 (Race Condition) | 2h | 系統底層穩定性 |
| **P1** | RAG 文件分段與基礎檢索 | 8h | 處理長文件的關鍵能力 |
| **P1** | 右鍵選單整合 (Context Menu) | 4h | 提升使用者開啟率 30% 以上 |
| **P2** | 智慧範本填寫 | 12h | 商業合約與標案場景的殺手功能 |
| **P2** | 資源自動回收 (Cleanup) | 2h | 伺服器性能優化 |
