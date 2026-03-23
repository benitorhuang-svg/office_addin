import { approveAll } from "@github/copilot-sdk";
import { ACPSessionConfig, ACPOptions } from "../../atoms/types.js";

/**
 * Molecule: Copilot CLI Option Builder
 */
export const buildCopilotCliOptions = (cfg: ACPSessionConfig): ACPOptions => ({
  clientOptions: { cliPath: undefined },
  sessionOptions: {
    model: cfg.model,
    streaming: cfg.streaming,
    onPermissionRequest: approveAll,
  },
});
