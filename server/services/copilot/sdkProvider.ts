/**
 * Atomic Refactored Entry Point
 * ═════════════════════════════════════════════════════════════
 * Delegates logic to Atoms, Molecules, and Organisms for clarity.
 * ═════════════════════════════════════════════════════════════
 */

// Atoms (Primitives)
export * from './atoms/types.js';
export * from './atoms/formatters.js';
export * from './atoms/core-config.js';

// Molecules (Functional building blocks)
export { getOrCreateClient, stopAllClients } from './molecules/client-manager.js';
export { resolveMethodFromContext, resolveACPOptions } from './molecules/option-resolver.js';

// Organisms (End-to-end services)
import { ModernSDKOrchestrator } from './organisms/sdk-orchestrator-v2.js';
export const sendPromptViaCopilotSdk = ModernSDKOrchestrator.sendPrompt.bind(ModernSDKOrchestrator);
export { warmUpClient, checkAgentHealth } from './organisms/health-prober.js';
