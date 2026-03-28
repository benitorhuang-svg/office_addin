import { ACPConnectionMethod } from '../copilot/atoms/types.js';

export interface NexusSystemState {
  power: string;
  provider: ACPConnectionMethod;
  isWarming: boolean;
}

/**
 * Molecule: System State Store
 * Persistent center for cross-environment state synchronization.
 */
class SystemStateStore {
  private state: NexusSystemState = {
    power: 'OFF',
    provider: 'copilot_cli',
    isWarming: false
  };

  public getState(): NexusSystemState {
    return { ...this.state };
  }

  public update(patch: Partial<NexusSystemState>) {
    if (patch.power !== undefined) this.state.power = patch.power;
    if (patch.provider !== undefined) this.state.provider = patch.provider;
    if (patch.isWarming !== undefined) this.state.isWarming = patch.isWarming;
    
    console.log(`[SystemStateStore] Update -> Power: ${this.state.power}, Provider: ${this.state.provider}`);
  }
}

export const GlobalSystemState = new SystemStateStore();
