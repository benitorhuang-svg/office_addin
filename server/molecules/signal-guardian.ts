import { stopAllClients } from '../services/copilot/sdkProvider.js';

/**
 * Molecule: Signal Guardian
 * Protects the system from dirty shutdowns.
 */
export const SignalGuardian = {
  active: false,

  register() {
    if (this.active) return;
    this.active = true;

    const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];
    
    signals.forEach(sig => {
      process.once(sig, async () => {
        console.log(`\n[Signal] ${sig} received. Commencing graceful exit...`);
        try {
          // 1. Close background agents
          await stopAllClients();
          console.log('[Signal] All sub-processes terminated.');
        } catch (err) {
          console.error('[Signal] Cleanup error:', err);
        } finally {
          process.exit(0);
        }
      });
    });
    
    console.log('[Signal] Guardian registered.');
  }
};
