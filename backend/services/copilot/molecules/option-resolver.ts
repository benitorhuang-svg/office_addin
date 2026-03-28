import config from '../../../config/env.js';
import { AzureInfo, ACPConnectionMethod, ACPSessionConfig, ACPOptions } from '../atoms/types.js';

// Atomized Option Builders
import { buildCopilotCliOptions } from './options/copilot-cli-options.js';
import { buildGeminiCliOptions } from './options/gemini-cli-options.js';
import { buildAzureByokOptions } from './options/azure-byok-options.js';
import { buildRemoteCliOptions } from './options/remote-cli-options.js';

/**
 * Molecule: Determine the best ACP method based on the current context.
 */
export function resolveMethodFromContext(
  modelName: string,
  azureInfo?: AzureInfo,
  _isExplicitCli: boolean = false
): ACPConnectionMethod {
  const isGeminiModel = modelName.toLowerCase().includes('gemini');
  if (isGeminiModel) return 'gemini_cli';
  
  const hasAzureKey = !!(azureInfo?.apiKey || config.AZURE_OPENAI_API_KEY);
  const hasRemotePort = !!config.COPILOT_AGENT_PORT;

  if (hasAzureKey) return 'azure_byok';
  if (hasRemotePort) return 'remote_cli';
  return 'copilot_cli';
}

/**
 * Molecule: Orchestrates specialized option builders based on target ACP method.
 */
export function resolveACPOptions(cfg: ACPSessionConfig): ACPOptions {
  switch (cfg.method) {
    case 'gemini_cli':
      return buildGeminiCliOptions(cfg);
    case 'copilot_cli':
      return buildCopilotCliOptions(cfg);
    case 'azure_byok':
      return buildAzureByokOptions(cfg);
    case 'remote_cli':
      return buildRemoteCliOptions(cfg);
    default:
      throw new Error(`Unknown ACP connection method: ${cfg.method}`);
  }
}
