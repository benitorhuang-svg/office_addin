import path from 'path';
import dotenv from 'dotenv';

// Resolve .env from project root
const projectRoot = path.resolve(process.cwd());
dotenv.config({ path: path.join(projectRoot, '.env') });

export function firstDefinedValue(...values: (string | undefined)[]): string {
  for (const value of values) {
    const normalized = String(value ?? '').trim();
    if (normalized) return normalized;
  }
  return '';
}

export const BASE_ENV = {
  PORT: process.env.PORT || 4000,
  COPILOT_AGENT_PORT: process.env.COPILOT_AGENT_PORT || '',
  
  GEMINI_CLI_PATH: process.env.GEMINI_CLI_PATH || 'gemini',
  GEMINI_CLI_ARGS: process.env.GEMINI_CLI_ARGS || '--acp',
  GEMINI_CLI_PORT: process.env.GEMINI_CLI_PORT || '8080',

  COPILOT_API_URL: process.env.COPILOT_API_URL || '',
  GITHUB_MODELS_API_VERSION: process.env.GITHUB_MODELS_API_VERSION || '2022-11-28',
  COPILOT_MODEL: firstDefinedValue(process.env.COPILOT_MODEL, 'gpt-5-mini'),

  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',

  AZURE_OPENAI_API_KEY: process.env.AZURE_OPENAI_API_KEY || '',
  AZURE_OPENAI_ENDPOINT: process.env.AZURE_OPENAI_ENDPOINT || '',
  AZURE_OPENAI_API_VERSION: process.env.AZURE_OPENAI_API_VERSION || '2024-10-21',
  AZURE_OPENAI_DEPLOYMENT: process.env.AZURE_OPENAI_DEPLOYMENT || '',

  get GITHUB_CLIENT_ID() { return process.env.GITHUB_CLIENT_ID || ''; },
  get GITHUB_CLIENT_SECRET() { return process.env.GITHUB_CLIENT_SECRET || ''; },

  GITHUB_MODELS_URL: process.env.GITHUB_MODELS_URL || 'https://models.github.ai/inference/chat/completions',
  GEMINI_REST_URL: process.env.GEMINI_REST_URL || 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
  DEFAULT_TEMPERATURE: process.env.DEFAULT_TEMPERATURE || '0.7',
  MAX_TOKENS: process.env.MAX_TOKENS || '2048',

  DEFAULT_RESPONSE_LANGUAGE: firstDefinedValue(process.env.DEFAULT_RESPONSE_LANGUAGE, '繁體中文'),
  DEFAULT_PERSONA: firstDefinedValue(process.env.DEFAULT_PERSONA, '文案高手，擅長根據主題延伸發想、提煉賣點、補充角度與產出可直接使用的內容'),
  APP_TITLE: firstDefinedValue(process.env.APP_TITLE, 'office_Agent'),
  FALLBACK_PRESETS_JSON: firstDefinedValue(process.env.FALLBACK_PRESETS_JSON, JSON.stringify([
    { id: "general", label: "General Writing", description: "Balanced drafting for normal editing." },
    { id: "summary", label: "Summary", description: "Concise summary of selection." }
  ])),
  PREVIEW_MODE_GUIDE_MD: firstDefinedValue(process.env.PREVIEW_MODE_GUIDE_MD, `您目前處於 **預覽模式**。<br>**本工具支援以下登入方式：**<br>1. **Google Gemini**：使用 CLI 或 API Key 。<br>2. **GitHub Copilot**：使用 CLI 、 透過OAuth 或 PAT 連線。<br>3. **Azure OpenAI**：使用自有憑證。<br>**如何開始使用？**<br>點擊右下角 **登出按鈕** 即可設定連線。`),
  DEFAULT_WORD_FONT_STYLE: firstDefinedValue(process.env.DEFAULT_WORD_FONT_STYLE, "font-family: '微軟正黑體', 'Microsoft JhengHei', 'Segoe UI', sans-serif; font-size: 11pt;"),

  // Optimization & Resilience
  RATE_LIMIT_RPM: process.env.RATE_LIMIT_RPM || '30',
  RATE_LIMIT_ENABLED: process.env.RATE_LIMIT_ENABLED !== 'false',
  IDLE_CLEANUP_MINUTES: process.env.IDLE_CLEANUP_MINUTES || '30',
  FALLBACK_MODELS: process.env.FALLBACK_MODELS || '',
  LOG_FORMAT: process.env.LOG_FORMAT || 'json',
};
