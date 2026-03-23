import { ServerOrchestrator } from './organisms/server-orchestrator.js';

/**
 * Entry Point: Office Agent Server
 * ═════════════════════════════════════════════════════════════
 * Completely Atomic Architecture (Atoms -> Molecules -> Organisms)
 * ═════════════════════════════════════════════════════════════
 */
// Server reload triggered for ENV update
ServerOrchestrator.start().catch((err) => {
  console.error('[Critical] Core Server Orchestration Failed:', err);
  process.exit(1);
});
