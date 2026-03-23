import { BASE_ENV, firstDefinedValue } from './atoms/base-env.js';

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
  COPILOT_AGENT_PORT: string;
  GEMINI_CLI_PATH: string;
  GEMINI_CLI_ARGS: string;
  GEMINI_CLI_PORT: string;
  DEFAULT_RESPONSE_LANGUAGE: string;
  DEFAULT_PERSONA: string;
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  getServerPatToken: () => string;
  getModelsToken: () => string;
  isAzureConfigured: () => boolean;
  isRemoteCliConfigured: () => boolean;
  isGeminiApiConfigured: () => boolean;
}

/**
 * Organism/Molecule: Config Orchestrator
 * Integrates raw atoms (BASE_ENV) and provides logic-based helpers.
 */
const config: ServerConfig = {
  get PORT() { return BASE_ENV.PORT; },
  get COPILOT_AGENT_PORT() { return BASE_ENV.COPILOT_AGENT_PORT; },
  get GEMINI_CLI_PATH() { return BASE_ENV.GEMINI_CLI_PATH; },
  get GEMINI_CLI_ARGS() { return BASE_ENV.GEMINI_CLI_ARGS; },
  get GEMINI_CLI_PORT() { return BASE_ENV.GEMINI_CLI_PORT; },
  get COPILOT_API_URL() { return BASE_ENV.COPILOT_API_URL; },
  get GITHUB_MODELS_API_VERSION() { return BASE_ENV.GITHUB_MODELS_API_VERSION; },
  get COPILOT_MODEL() { return BASE_ENV.COPILOT_MODEL; },

  get AVAILABLE_MODELS_GITHUB() {
    return (process.env.AVAILABLE_MODELS_GITHUB || 'GPT-5.4,GPT-5.4 mini,GPT-5.2 Pro,Claude 4.8 Opus,Claude 4.8 Sonnet')
      .split(',')
      .map(m => m.trim());
  },
  get AVAILABLE_MODELS_GEMINI() {
    return (process.env.AVAILABLE_MODELS_GEMINI || 'gemini-3.1-pro,gemini-3.1-flash,gemini-3.1-flash-lite,gemini-2.5-pro,gemini-2.5-flash')
      .split(',')
      .map(m => m.trim());
  },
  get AVAILABLE_MODELS() {
    return [...this.AVAILABLE_MODELS_GITHUB, ...this.AVAILABLE_MODELS_GEMINI];
  },

  get GEMINI_API_KEY() { return BASE_ENV.GEMINI_API_KEY; },
  get AZURE_OPENAI_API_KEY() { return BASE_ENV.AZURE_OPENAI_API_KEY; },
  get AZURE_OPENAI_ENDPOINT() { return BASE_ENV.AZURE_OPENAI_ENDPOINT; },
  get AZURE_OPENAI_API_VERSION() { return BASE_ENV.AZURE_OPENAI_API_VERSION; },
  get AZURE_OPENAI_DEPLOYMENT() { return BASE_ENV.AZURE_OPENAI_DEPLOYMENT; },
  get DEFAULT_RESPONSE_LANGUAGE() { return BASE_ENV.DEFAULT_RESPONSE_LANGUAGE; },
  get DEFAULT_PERSONA() { return BASE_ENV.DEFAULT_PERSONA; },
  get GITHUB_CLIENT_ID() { return BASE_ENV.GITHUB_CLIENT_ID; },
  get GITHUB_CLIENT_SECRET() { return BASE_ENV.GITHUB_CLIENT_SECRET; },

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
  ),

  isAzureConfigured: () => !!(config.AZURE_OPENAI_API_KEY && config.AZURE_OPENAI_ENDPOINT),
  isRemoteCliConfigured: () => !!config.COPILOT_AGENT_PORT,
  isGeminiApiConfigured: () => !!config.GEMINI_API_KEY,
};

export default config;
