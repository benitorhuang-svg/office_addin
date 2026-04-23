/**
 * Atom: Locales
 * Centralized dictionary for all UI text in Nexus Center.
 */

export type Language = 'en' | 'zh';

export type LocaleKey = 
    | "UPLINK_READY" | "SYSTEM_OFFLINE" | "AI_ACTIVATE" | "CLOUD_AUTH" 
    | "CLOUD_LINK" | "START_SESSION" | "SESSION_ON" | "LATENCY" 
    | "TIME" | "RECONNECTING" | "THEME_SHIFT" | "REROUTING" 
    | "IDENTITY_VERIFIED" | "SESSION_ESTABLISHED" | "SESSION_TERMINATED"
    | "NEXUS_LOCKED" | "UPLINK_DISCONNECTED" | "CHECK_LINK_STATUS" | "SYSTEM_STANDBY"
    | "OFFLINE_HINT" | "WELCOME_TITLE" | "WELCOME_HUB" | "HOW_TO_USE"
    | "STEP_01" | "STEP_01_DESC" | "STEP_02" | "STEP_02_DESC"
    | "GEMINI_GUIDE" | "GEMINI_GUIDE_DESC_API" | "GEMINI_GUIDE_DESC_CLI"
    | "PREREQUISITES" | "BOOT_BACKEND" | "BOOT_DESC" | "ESTABLISH_LINK"
    | "ESTABLISH_DESC" | "LIVE_MODE" | "PREVIEW_MODE" | "VERSION_FOOTER"
    | "GATHERING_CONTEXT" | "SENDING_UPLINK" | "ERROR_NO_RESPONSE"
    | "UNKNOWN_ERROR" | "RECONNECT_NOW" | "SERVER_PAT" | "TRUST_SYSTEM_UPLINK" | "TRUST_UPLINK_DESC" | "UPLINK_PROBING"
    | "STEP_DIAGNOSTIC" | "STEP_CONTEXT" | "STEP_THOUGHT" | "STEP_UPLINK" | "COPIED_TO_CLIPBOARD";

export const LOCALES: Record<Language, Record<LocaleKey, string>> = {
    en: {
        UPLINK_READY: "Uplink_Ready",
        SYSTEM_OFFLINE: "System_Offline",
        AI_ACTIVATE: "AI_Activate",
        CLOUD_AUTH: "Cloud_Auth",
        CLOUD_LINK: "Cloud_Link",
        START_SESSION: "Start_Session",
        SESSION_ON: "Session_On",
        LATENCY: "Latency",
        TIME: "Time",
        RECONNECTING: "Reconnecting_Uplink",
        THEME_SHIFT: "Theme_Shift",
        REROUTING: "Rerouting_Uplink",
        IDENTITY_VERIFIED: "Identity_Verified",
        SESSION_ESTABLISHED: "Security_Uplink_Established",
        SESSION_TERMINATED: "Uplink_Terminated",
        NEXUS_LOCKED: "Nexus_Locked",
        UPLINK_DISCONNECTED: "Uplink_Disconnected",
        CHECK_LINK_STATUS: "Check_Link_Status",
        SYSTEM_STANDBY: "System_Standby_Mode",
        OFFLINE_HINT: "Please activate the Nexus Power UI from your dashboard to initialize AI capabilities.",
        WELCOME_TITLE: "Let's edit together",
        WELCOME_HUB: "Format, analyze, and summarize your content with Copilot. If you want a chat response, you can stop editing.",
        HOW_TO_USE: "HOW_TO_USE",
        STEP_01: "AI Chat & Presets",
        STEP_01_DESC: "Select writing presets or enter prompts to interact with Word content.",
        STEP_02: "Multi-Modal Switching",
        STEP_02_DESC: "Switch between Gemini, Copilot, or Azure nodes and track latency.",
        GEMINI_GUIDE: "GEMINI_CONNECTION_GUIDE",
        GEMINI_GUIDE_DESC_API: "Direct cloud call via Google AI node, low latency but limited features.",
        GEMINI_GUIDE_DESC_CLI: "For advanced users. Supports full MCP and local file access.",
        PREREQUISITES: "PREREQUISITES",
        BOOT_BACKEND: "Launch Backend",
        BOOT_DESC: "Ensure nexus-center.vbs or Docker container is running.",
        ESTABLISH_LINK: "Establish Link",
        ESTABLISH_DESC: "Select connection method and complete cloud authentication.",
        LIVE_MODE: "LIVE_MODE (All Links)",
        PREVIEW_MODE: "PREVIEW_MODE",
        VERSION_FOOTER: "Nexus_Center_V6.0",
        GATHERING_CONTEXT: "Gathering Word context...",
        SENDING_UPLINK: "📡 Sending request to Uplink...",
        ERROR_NO_RESPONSE: "No response received from the agent.",
        UNKNOWN_ERROR: "An unexpected error occurred in the Nexus uplink.",
        RECONNECT_NOW: "Reconnect Now",
        SERVER_PAT: "Server PAT",
        TRUST_SYSTEM_UPLINK: "Trust System Uplink",
        TRUST_UPLINK_DESC: "If you see a certificate warning, click 'Advanced' and 'Proceed' to enable secure communication.",
        UPLINK_PROBING: "UPLINK_PROBING...",
        STEP_DIAGNOSTIC: "Analyzing Word Workspace",
        STEP_CONTEXT: "Mapping Contextual Entities",
        STEP_THOUGHT: "Synthesizing Logical Inference",
        STEP_UPLINK: "Deploying AI Strategic Request",
        COPIED_TO_CLIPBOARD: "Copied to clipboard!"
    },
    zh: {
        UPLINK_READY: "連線就緒",
        SYSTEM_OFFLINE: "系統離線",
        AI_ACTIVATE: "AI_執行中",
        CLOUD_AUTH: "雲端驗證",
        CLOUD_LINK: "雲端鏈接",
        START_SESSION: "啟動會話",
        SESSION_ON: "會話中",
        LATENCY: "延遲",
        TIME: "運行時間",
        RECONNECTING: "重新連線中",
        THEME_SHIFT: "切換主題",
        REROUTING: "路由切換中",
        IDENTITY_VERIFIED: "身份驗證成功",
        SESSION_ESTABLISHED: "安全連線已建立",
        SESSION_TERMINATED: "連線已終止",
        NEXUS_LOCKED: "Nexus_已鎖定",
        UPLINK_DISCONNECTED: "連線已掛掛斷",
        CHECK_LINK_STATUS: "檢查連線狀態",
        SYSTEM_STANDBY: "系統待命模式",
        OFFLINE_HINT: "請從儀表板啟動 Nexus 電源 UI 以初始化 AI 能力。",
        WELCOME_TITLE: "讓我們一起編輯",
        WELCOME_HUB: "您的智慧文件編輯夥伴，隨時準備為您服務。您可以透過下方選擇適合的 AI 核心來啟動您的文件自動化流程。",
        HOW_TO_USE: "快速操作指南",
        STEP_01: "模態切換與智慧對話",
        STEP_01_DESC: "隨時切換 AI 核心並輸入指令，讓 AI 協助處理文件內容。",
        STEP_02: "多核心連線協議",
        STEP_02_DESC: "深度集成 Google 與 GitHub 服務，支援企業級安全通訊。",
        GEMINI_GUIDE: "GEMINI 連線指南",
        GEMINI_GUIDE_DESC_API: "高效能雲端模型，支援多模態對話與文件分析。",
        GEMINI_GUIDE_DESC_CLI: "開發者專用模式，支援完整 MCP 協議。",
        PREREQUISITES: "前置需求",
        BOOT_BACKEND: "啟動連線核心",
        BOOT_DESC: "確保您的後端服務已經啟動並處於監聽狀態。",
        ESTABLISH_LINK: "建立授權連線",
        ESTABLISH_DESC: "選擇適用的連線協議並完成身份授權流程。",
        LIVE_MODE: "正式啟動連線",
        PREVIEW_MODE: "使用預覽模式",
        VERSION_FOOTER: "Nexus_控制中心_V6.0",
        GATHERING_CONTEXT: "正在收集文件內容...",
        SENDING_UPLINK: "📡 正在將請求傳送至雲端核心...",
        ERROR_NO_RESPONSE: "未收到來自 AI 的回應。",
        UNKNOWN_ERROR: "Nexus 連線發生了未知的錯誤。",
        RECONNECT_NOW: "立刻重新連線",
        SERVER_PAT: "伺服器授權金鑰",
        TRUST_SYSTEM_UPLINK: "信任系統核心證書",
        TRUST_UPLINK_DESC: "請確保您的連線環境已正確信任開發證書。",
        UPLINK_PROBING: "連線探測中...",
        STEP_DIAGNOSTIC: "分析 Word 工作環境",
        STEP_CONTEXT: "封裝上下文內容對象",
        STEP_THOUGHT: "生成邏輯推理鏈結",
        STEP_UPLINK: "部署 AI 策略請求",
        COPIED_TO_CLIPBOARD: "內容已複製到剪貼簿！"
    }
};
