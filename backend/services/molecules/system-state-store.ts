import type { ACPConnectionMethod } from '../copilot/atoms/types.js';
import { logger } from '../../core/atoms/logger.js';

export interface NexusSystemState {
  power: string;
  provider: ACPConnectionMethod;
  isWarming: boolean;
  isStreaming: boolean;
  /** Tokens generated per second in the current/last streaming turn. */
  tokensPerSec: number;
  /** Time-to-first-token in milliseconds (-1 = not available). */
  ttft: number;
  /** Human-readable label of the active persona / model preset. */
  activePersona: string;
}

/**
 * Molecule: System State Store
 * Persistent center for cross-environment state synchronization.
 */
class SystemStateStore {
  private state: NexusSystemState = {
    power: 'OFF',
    provider: 'copilot_cli',
    isWarming: false,
    isStreaming: false,
    tokensPerSec: 0,
    ttft: -1,
    activePersona: 'General',
  };

  public getState(): NexusSystemState {
    return { ...this.state };
  }

  public update(patch: Partial<NexusSystemState>) {
    if (patch.power !== undefined) this.state.power = patch.power;
    if (patch.provider !== undefined) this.state.provider = patch.provider;
    if (patch.isWarming !== undefined) this.state.isWarming = patch.isWarming;
    if (patch.isStreaming !== undefined) this.state.isStreaming = patch.isStreaming;
    if (patch.tokensPerSec !== undefined) this.state.tokensPerSec = patch.tokensPerSec;
    if (patch.ttft !== undefined) this.state.ttft = patch.ttft;
    if (patch.activePersona !== undefined) this.state.activePersona = patch.activePersona;

    logger.info('SystemStateStore', 'System state updated', this.state);
  }
}

export const GlobalSystemState = new SystemStateStore();
