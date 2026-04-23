import type { ACPSessionConfig, ACPOptions } from "@shared/atoms/ai-core/types.js";
import { CORE_SDK_CONFIG } from "@shared/atoms/ai-core/core-config.js";
import { handleCopilotPermissionRequest } from '@shared/atoms/ai-core/permission-policy.js';

/**
 * Molecule: Remote CLI (Acp Port) Option Builder
 */
export const buildRemoteCliOptions = (cfg: ACPSessionConfig): ACPOptions => {
  const port = cfg.remotePort || CORE_SDK_CONFIG.DEFAULT_REMOTE_PORT;
  return {
    clientOptions: {
      cliUrl: `localhost:${port}`,
      cliPath: 'copilot',
    },
    sessionOptions: {
      model: cfg.model,
      streaming: cfg.streaming,
      onPermissionRequest: handleCopilotPermissionRequest,
    },
  };
};
