/**
 * Copilot Service Types - Atomic Definitions
 */
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
