/**
 * Atomic Refactored Entry Point
 * ═════════════════════════════════════════════════════════════
 * Delegates logic to Atoms, Molecules, and Organisms for clarity.
 * ═════════════════════════════════════════════════════════════
 */

// Atoms (Primitives)
export * from '../atoms/types.js';
export * from '../atoms/formatters.js';
export * from '../atoms/core-config.js';

// Molecules (Functional building blocks)
export { getOrCreateClient, stopAllClients } from '../molecules/client-manager.js';
export { resolveMethodFromContext, resolveACPOptions } from '../molecules/option-resolver.js';
export { getSessionTools } from '../molecules/tool-registry.js';
export { resolveInput, waitForUserInput, clearAllPendingInputs } from '../molecules/pending-input-queue.js';
export { generateSessionId, createSession, cleanupSession, cleanupAllSessions } from '../molecules/session-lifecycle.js';

// Organisms (End-to-end services)
import { ModernSDKOrchestrator } from './sdk-orchestrator-v2.js';
export const sendPromptViaCopilotSdk = ModernSDKOrchestrator.sendPrompt.bind(ModernSDKOrchestrator);
export { warmUpClient, checkAgentHealth } from './health-prober.js';
