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
  GEMINI_CLI_ARGS: process.env.GEMINI_CLI_ARGS || '--experimental-acp',
  GEMINI_CLI_PORT: process.env.GEMINI_CLI_PORT || '8080',

  COPILOT_API_URL: process.env.COPILOT_API_URL || 'https://models.github.ai/inference/chat/completions',
  GITHUB_MODELS_API_VERSION: process.env.GITHUB_MODELS_API_VERSION || '2022-11-28',
  COPILOT_MODEL: firstDefinedValue(process.env.COPILOT_MODEL, 'GPT-5 mini'),

  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',

  AZURE_OPENAI_API_KEY: process.env.AZURE_OPENAI_API_KEY || '',
  AZURE_OPENAI_ENDPOINT: process.env.AZURE_OPENAI_ENDPOINT || '',
  AZURE_OPENAI_API_VERSION: process.env.AZURE_OPENAI_API_VERSION || '2024-10-21',
  AZURE_OPENAI_DEPLOYMENT: process.env.AZURE_OPENAI_DEPLOYMENT || '',

  GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID || '',
  GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET || '',

  DEFAULT_RESPONSE_LANGUAGE: firstDefinedValue(process.env.DEFAULT_RESPONSE_LANGUAGE, '繁體中文'),
  DEFAULT_PERSONA: firstDefinedValue(process.env.DEFAULT_PERSONA, '文案高手，擅長根據主題延伸發想、提煉賣點、補充角度與產出可直接使用的內容'),
};
