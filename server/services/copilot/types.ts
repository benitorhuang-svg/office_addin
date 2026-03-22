/**
 * Copilot Service Types - Atomic Definitions
 * Aligned with the 4 ACP Connection Methods:
 *   1. gemini_cli   — Gemini CLI (--experimental-acp)
 *   2. copilot_cli   — Default GitHub Copilot CLI
 *   3. azure_byok    — Azure OpenAI BYOK (Bring Your Own Key)
 *   4. remote_cli    — Remote Copilot CLI via port
 *   5. gemini_api    — Native Gemini REST (non-SDK, direct REST)
 *   6. github_pat    — GitHub Models API with PAT
 *   7. preview       — Preview / Fallback mode
 */

/** All ACP-based connection methods that go through CopilotClient SDK */
export type ACPConnectionMethod = 'gemini_cli' | 'copilot_cli' | 'azure_byok' | 'remote_cli';

/** All supported auth/provider identifiers across the whole system */
export type AuthProvider =
  | ACPConnectionMethod
  | 'gemini_api'
  | 'github_pat'
  | 'azure_openai'
  | 'preview';

export interface PromptPayload {
  system: string;
  user: string;
}

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

/** Configuration passed to the unified SDK dispatcher */
export interface ACPSessionConfig {
  method: ACPConnectionMethod;
  model: string;
  streaming: boolean;
  azure?: AzureInfo;
  remotePort?: string;
}

/** Result of an ACP health check probe */
export interface ACPHealthResult {
  ok: boolean;
  type: ACPConnectionMethod | 'none';
  latency?: number;
  detail?: string;
}
