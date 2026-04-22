import type { ACPSessionConfig, ACPOptions } from "../../atoms/types.js";
import { CORE_SDK_CONFIG } from "../../atoms/core-config.js";
import { handleCopilotPermissionRequest } from '../../atoms/permission-policy.js';

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
