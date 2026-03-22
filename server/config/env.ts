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
  AZURE_OPENAI_API_KEY: string;
  AZURE_OPENAI_ENDPOINT: string;
  AZURE_OPENAI_API_VERSION: string;
  AZURE_OPENAI_DEPLOYMENT: string;
  DEFAULT_RESPONSE_LANGUAGE: string;
  DEFAULT_PERSONA: string;
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  COPILOT_AGENT_PORT: string;
  getServerPatToken: () => string;
  getModelsToken: () => string;
}

const config: ServerConfig = {
  get PORT() {
    return process.env.PORT || 4000;
  },
  get COPILOT_AGENT_PORT() {
    return process.env.COPILOT_AGENT_PORT || '';
  },
  get COPILOT_API_URL() {
    return process.env.COPILOT_API_URL || 'https://models.github.ai/inference/chat/completions';
  },
  get GITHUB_MODELS_API_VERSION() {
    return process.env.GITHUB_MODELS_API_VERSION || '2022-11-28';
  },
  get COPILOT_MODEL() {
    return firstDefinedValue(process.env.COPILOT_MODEL, 'GPT-5 mini');
  },
  get AVAILABLE_MODELS_GITHUB() {
    return (process.env.AVAILABLE_MODELS_GITHUB || 'GPT-5.4,GPT-5.4 mini,GPT-5.2 Pro,Claude 4.8 Opus,Claude 4.8 Sonnet')
      .split(',')
      .map(m => m.trim());
  },
  get AVAILABLE_MODELS_GEMINI() {
    return (process.env.AVAILABLE_MODELS_GEMINI || 'gemini-1.5-flash,gemini-1.5-pro,gemini-3.1-pro-preview,gemini-3.1-flash-preview,gemini-2.0-flash-exp')
      .split(',')
      .map(m => m.trim());
  },
  get AVAILABLE_MODELS() {
    return [...this.AVAILABLE_MODELS_GITHUB, ...this.AVAILABLE_MODELS_GEMINI];
  },
  get GEMINI_API_KEY() {
    return process.env.GEMINI_API_KEY || '';
  },
  get AZURE_OPENAI_API_KEY() {
    return process.env.AZURE_OPENAI_API_KEY || '';
  },
  get AZURE_OPENAI_ENDPOINT() {
    return process.env.AZURE_OPENAI_ENDPOINT || '';
  },
  get AZURE_OPENAI_API_VERSION() {
    return process.env.AZURE_OPENAI_API_VERSION || '2024-10-21';
  },
  get AZURE_OPENAI_DEPLOYMENT() {
    return process.env.AZURE_OPENAI_DEPLOYMENT || '';
  },
  get DEFAULT_RESPONSE_LANGUAGE() {
    return firstDefinedValue(process.env.DEFAULT_RESPONSE_LANGUAGE, '繁體中文');
  },
  get DEFAULT_PERSONA() {
    return firstDefinedValue(process.env.DEFAULT_PERSONA, '文案高手，擅長根據主題延伸發想、提煉賣點、補充角度與產出可直接使用的內容');
  },
  get GITHUB_CLIENT_ID() {
    return process.env.GITHUB_CLIENT_ID || '';
  },
  get GITHUB_CLIENT_SECRET() {
    return process.env.GITHUB_CLIENT_SECRET || '';
  },
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
