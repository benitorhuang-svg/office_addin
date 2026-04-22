import type { ACPConnectionMethod } from '../copilot/atoms/types.js';
import { logger } from '../../atoms/logger.js';

export interface NexusSystemState {
  power: string;
  provider: ACPConnectionMethod;
  isWarming: boolean;
  isStreaming: boolean;
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
    isStreaming: false
  };

  public getState(): NexusSystemState {
    return { ...this.state };
  }

  public update(patch: Partial<NexusSystemState>) {
    if (patch.power !== undefined) this.state.power = patch.power;
    if (patch.provider !== undefined) this.state.provider = patch.provider;
    if (patch.isWarming !== undefined) this.state.isWarming = patch.isWarming;
    if (patch.isStreaming !== undefined) this.state.isStreaming = patch.isStreaming;

    logger.info('SystemStateStore', 'System state updated', this.state);
  }
}

export const GlobalSystemState = new SystemStateStore();
