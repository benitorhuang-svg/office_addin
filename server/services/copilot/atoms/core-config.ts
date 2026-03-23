import config from '../../../config/env.js';

/**
 * Atom: Core SDK behavior constants
 * Ensures the 300s timeout is centralized.
 */
export const CORE_SDK_CONFIG = {
  // Global internal SDK timeout for session.sendAndWait
  GEN_TIMEOUT_MS: 300000, // 5 minutes (300 seconds)
  
  // Default CLI method if nothing else matches
  DEFAULT_METHOD: 'copilot_cli' as const,
  
  // Default Remote Agent Port
  DEFAULT_REMOTE_PORT: config.COPILOT_AGENT_PORT || '17817',
  
  // Azure default API version
  AZURE_API_VERSION: config.AZURE_OPENAI_API_VERSION || '2024-10-21',

  // Watchdog & Timeout behaviors (Configurable via ENV)
  WATCHDOG_INACTIVITY_MS: Number(process.env.WATCHDOG_INACTIVITY_MS || 12000), 
  USER_INPUT_TIMEOUT_MS: Number(process.env.USER_INPUT_TIMEOUT_MS || 180000),

  // Localized Strategy & Tool messages
  MOCK_ACP_SEARCH_RESULT: process.env.MOCK_ACP_SEARCH_RESULT || "【搜尋結果】在 GitHub Copilot SDK 脈絡下，ACP 指的是『Agent Connection Protocol』。這是一個連接 SDK 與本地 Agent (CLI) 的自定義通訊協定。常見連接方式包括：copilot_cli, gemini_cli, azure_byok。",
  PROGRESS_FEEDBACK_PREFIX: process.env.PROGRESS_FEEDBACK_PREFIX || "\n> 🔍 *AI 正在針對「",
  PROGRESS_FEEDBACK_SUFFIX: process.env.PROGRESS_FEEDBACK_SUFFIX || "」進行預研與思考...*\n\n",
  ERROR_SDK_CONNECTION_FAIL: process.env.ERROR_SDK_CONNECTION_FAIL || "SDK V2 連接失敗",
  MOCK_SEARCH_NO_RESULT: process.env.MOCK_SEARCH_NO_RESULT || "搜尋結果摘要 ({query})：未找到與專案直接相關的唯一定義。建議詢問使用者是否指某種特定的策略或協定。",
  MAX_SDK_RETRIES: Number(process.env.MAX_SDK_RETRIES || 1),
};
