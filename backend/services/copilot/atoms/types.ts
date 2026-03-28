import { CopilotClientOptions, SessionConfig } from "@github/copilot-sdk";

export type ACPConnectionMethod = 'copilot_cli' | 'gemini_cli' | 'azure_byok' | 'remote_cli';

/** All supported auth/provider identifiers across the whole system */
export type AuthProvider =
  | ACPConnectionMethod
  | 'gemini_api'
  | 'github_pat'
  | 'azure_openai'
  | 'preview';

export interface AgentEnvironment {
  type: 'commercial' | 'gcc' | 'consumer' | 'preview';
  apiVersion?: string;
  endpointUrl?: string;
  securityMode?: 'high' | 'standard';
}

export interface AzureInfo {
  apiKey?: string;
  endpoint?: string;
  deployment?: string;
}

export interface PromptPayload {
  system: string;
  user: string;
}

/** Gemini/OpenAI-compatible chat completion response shape */
export interface ChatCompletionResponse {
  choices?: Array<{
    message?: { content?: string };
    delta?: { content?: string };
  }>;
  error?: { message?: string };
}

/** The final JSON response sent to the frontend */
export interface CopilotResponse {
  text: string;
  actions: Array<{ type: string; value: string }>;
  model: string;
  timestamp: string;
}

export interface ACPSessionConfig {
  method: ACPConnectionMethod;
  model: string;
  streaming: boolean;
  azure?: AzureInfo;
  remotePort?: string;
  geminiKey?: string;
  githubToken?: string;
}

export interface ACPHealthResult {
  ok: boolean;
  type: string;
  latency?: number;
  detail?: string;
}

/** Pairs client and session options per SDK method requirement */
export interface ACPOptions {
  clientOptions: CopilotClientOptions;
  sessionOptions: SessionConfig;
}

/** Atom: BYOK provider configuration (azure, openai, etc.) */
export interface ACPProviderConfig {
  type?: 'openai' | 'azure' | 'anthropic';
  baseUrl: string;
  apiKey?: string;
  bearerToken?: string;
  wireApi?: 'completions' | 'responses';
  azure?: { apiVersion?: string };
}

export interface WritingPreset {
  id: string;
  label: string;
  system: string;
  description: string;
}

export interface OfficeContext {
  host?: string;
  selectionText?: string;
  documentText?: string;
}

export interface CopilotEvent {
  host?: string;
  selectionText?: string;
  documentText?: string;
}
