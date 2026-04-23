import type { SessionConfig } from "@github/copilot-sdk";
import { logger } from '../../../core/atoms/logger.js';

const ENABLE_BUILTIN_TOOLS = process.env.COPILOT_ENABLE_BUILTIN_TOOLS === 'true';

export function applyLeastPrivilegeToolSurface(sessionOptions: SessionConfig): Pick<SessionConfig, 'availableTools' | 'excludedTools'> {
  if (ENABLE_BUILTIN_TOOLS) {
    logger.warn('SDKToolSurface', 'Built-in SDK tools are enabled by environment override');
    return {
      availableTools: sessionOptions.availableTools,
      excludedTools: sessionOptions.excludedTools,
    };
  }

  // GitHub Copilot SDK docs: availableTools: [] disables built-in tools while custom
  // tools remain available. ask_user is enabled separately via onUserInputRequest.
  return {
    availableTools: [],
    excludedTools: undefined,
  };
}