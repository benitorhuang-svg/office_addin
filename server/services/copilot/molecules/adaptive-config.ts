import { AgentEnvironment, ACPConnectionMethod } from '../atoms/types.js';
import config from '../../../config/env.js';

/**
 * Resolves the appropriate environment configuration (2026 Adaptive Pattern).
 */
export function getAdaptiveConfig(loginEnv: string = 'commercial'): AgentEnvironment {
  switch (loginEnv.toLowerCase()) {
    case 'gcc':
      return {
        type: 'gcc',
        apiVersion: 'v1',
        endpointUrl: 'https://generativelanguage.googleapis.com/v1',
        securityMode: 'high',
      };
    case 'preview':
      return {
        type: 'preview',
        apiVersion: 'v1beta',
        endpointUrl: 'https://generativelanguage.googleapis.com/v1beta',
        securityMode: 'standard',
      };
    default:
      return {
        type: 'commercial',
        apiVersion: 'v1beta',
        endpointUrl: 'https://generativelanguage.googleapis.com/v1beta',
        securityMode: 'standard',
      };
  }
}

/**
 * Returns a human-readable description of an ACP connection method.
 * Useful for UI display and logging.
 */
export function describeACPMethod(method: ACPConnectionMethod): { label: string; description: string } {
  const descriptions: Record<ACPConnectionMethod, { label: string; description: string }> = {
    gemini_cli: {
      label: 'Gemini CLI (ACP)',
      description: '透過 Gemini CLI 與 --experimental-acp 進行串接，支援任何 ACP 相容 Agent',
    },
    copilot_cli: {
      label: 'GitHub Copilot CLI',
      description: '使用您的 GitHub Copilot 訂閱權限，預設串接方式',
    },
    azure_byok: {
      label: 'Azure OpenAI (BYOK)',
      description: '使用自己的 Azure OpenAI 金鑰，支援自訂模型部署',
    },
    remote_cli: {
      label: '遠端 Copilot CLI',
      description: '連接正在執行的遠端 Copilot CLI 實例 (copilot --acp --port)',
    },
  };

  return descriptions[method] || { label: method, description: '未知的連線方式' };
}

/**
 * Returns a list of all currently available (configured) ACP methods
 * based on the server environment.
 */
export function getAvailableACPMethods(): ACPConnectionMethod[] {
  const methods: ACPConnectionMethod[] = [];

  // Copilot CLI is always available as baseline
  methods.push('copilot_cli');

  // Gemini CLI is always available (requires `gemini` CLI to be installed)
  methods.push('gemini_cli');

  // Azure BYOK requires key + endpoint
  if (config.isAzureConfigured()) {
    methods.push('azure_byok');
  }

  // Remote CLI requires port configuration
  if (config.isRemoteCliConfigured()) {
    methods.push('remote_cli');
  }

  return methods;
}
