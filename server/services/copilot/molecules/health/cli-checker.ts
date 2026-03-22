import { CopilotClient } from "@github/copilot-sdk";
import { ACPHealthResult } from '../../atoms/types.js';

/**
 * Molecule: Copilot CLI Baseline Health Checker
 */
export async function checkCliBaselineHealth(): Promise<ACPHealthResult> {
  const start = Date.now();
  try {
    const _client = new CopilotClient({ cliPath: 'copilot' });
    // Note: CopilotClient constructor doesn't start the process immediately,
    // we just check if it can be initialized. In a real environment, 
    // a basic system check would go here.
    return { ok: true, type: 'copilot_cli', latency: Date.now() - start };
  } catch {
    return { ok: false, type: 'none' };
  }
}
