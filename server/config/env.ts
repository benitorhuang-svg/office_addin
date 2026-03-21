import path from 'path';
import dotenv from 'dotenv';

// Resolve .env from project root (two levels up from server/config/)
const projectRoot = path.resolve(process.cwd());
dotenv.config({ path: path.join(projectRoot, '.env') });

function firstDefinedValue(...values: (string | undefined)[]): string {
  for (const value of values) {
    const normalized = String(value ?? '').trim();
    if (normalized) return normalized;
  }
  return '';
}

export interface ServerConfig {
  PORT: string | number;
  COPILOT_API_URL: string;
  GITHUB_MODELS_API_VERSION: string;
  COPILOT_MODEL: string;
  AVAILABLE_MODELS_GITHUB: string[];
  AVAILABLE_MODELS_GEMINI: string[];
  AVAILABLE_MODELS: string[];
  GEMINI_API_KEY: string;
  DEFAULT_RESPONSE_LANGUAGE: string;
  DEFAULT_PERSONA: string;
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  getServerPatToken: () => string;
  getModelsToken: () => string;
}

const config: ServerConfig = {
  PORT: process.env.PORT || 4000,
  COPILOT_API_URL: process.env.COPILOT_API_URL || 'https://models.github.ai/inference/chat/completions',
  GITHUB_MODELS_API_VERSION: process.env.GITHUB_MODELS_API_VERSION || '2022-11-28',
  COPILOT_MODEL: firstDefinedValue(process.env.COPILOT_MODEL, 'GPT-5 mini'),
  AVAILABLE_MODELS_GITHUB: (process.env.AVAILABLE_MODELS_GITHUB || 'GPT-5 mini,Claude Opus 4.6,Claude Sonnet 4.6,GPT-5.4,GPT-5.4 mini')
    .split(',')
    .map(m => m.trim()),
  AVAILABLE_MODELS_GEMINI: (process.env.AVAILABLE_MODELS_GEMINI || 'gemini-1.5-flash,gemini-1.5-pro,gemini-1.5-flash-8b,gemini-2.0-flash-exp')
    .split(',')
    .map(m => m.trim()),
  get AVAILABLE_MODELS() {
    return [...this.AVAILABLE_MODELS_GITHUB, ...this.AVAILABLE_MODELS_GEMINI];
  },
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  DEFAULT_RESPONSE_LANGUAGE: firstDefinedValue(process.env.DEFAULT_RESPONSE_LANGUAGE, '繁體中文'),
  DEFAULT_PERSONA: firstDefinedValue(process.env.DEFAULT_PERSONA, '文案高手，擅長根據主題延伸發想、提煉賣點、補充角度與產出可直接使用的內容'),
  GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID || '',
  GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET || '',
  getServerPatToken: () => firstDefinedValue(
    process.env.COPILOT_GITHUB_TOKEN,
    process.env.GH_TOKEN,
    process.env.GITHUB_TOKEN,
    process.env.GITHUB_PAT,
    process.env.COPILOT_PAT
  ),
  getModelsToken: () => firstDefinedValue(
    process.env.GITHUB_MODELS_TOKEN,
    process.env.COPILOT_GITHUB_TOKEN,
    process.env.GH_TOKEN,
    process.env.GITHUB_TOKEN,
    process.env.GITHUB_PAT,
    process.env.COPILOT_PAT
  )
};

export default config;
