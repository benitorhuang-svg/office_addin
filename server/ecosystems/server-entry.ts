// Suppress experimental/deprecation warnings from child processes (e.g. Copilot CLI)
process.env.NODE_NO_WARNINGS = '1';

import { ServerOrchestrator } from '../organisms/server-orchestrator.js';

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
