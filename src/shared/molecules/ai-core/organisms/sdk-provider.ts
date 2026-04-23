/**
 * Atomic Refactored Entry Point
 * ═════════════════════════════════════════════════════════════
 * Delegates logic to Atoms, Molecules, and Organisms for clarity.
 * ═════════════════════════════════════════════════════════════
 */

import type { 
  ACPConnectionMethod, 
  AzureInfo, 
  OfficeContext 
} from '@shared/atoms/ai-core/types.js';

// Atoms (Primitives)
export * from '@shared/atoms/ai-core/types.js';
export * from '@shared/atoms/ai-core/formatters.js';
export * from '@shared/atoms/ai-core/core-config.js';

// Molecules (Functional building blocks)
export { getOrCreateClient, stopAllClients } from '@shared/molecules/ai-core/client-manager.js';
export { resolveMethodFromContext, resolveACPOptions } from '@shared/molecules/ai-core/option-resolver.js';
export { getSessionTools } from '@shared/molecules/ai-core/tool-registry.js';
export { resolveInput, waitForUserInput, clearAllPendingInputs } from '@shared/molecules/ai-core/pending-input-queue.js';
export { generateSessionId, createSession, cleanupSession, cleanupAllSessions } from '@shared/molecules/ai-core/session-lifecycle.js';

// Organisms (End-to-end services)
import { ModernSDKOrchestrator } from '@orchestrator/workflow-graph.js';

export const sendPromptViaCopilotSdk = (
  prompt: string,
  onChunk?: (chunk: string) => void,
  isExplicitCli: boolean = false,
  modelName?: string,
  azureInfo?: AzureInfo,
  methodOverride?: ACPConnectionMethod,
  geminiKey?: string,
  officeContext?: OfficeContext,
  signal?: AbortSignal,
  sessionId?: string
) => ModernSDKOrchestrator.sendPrompt(
  prompt, onChunk, isExplicitCli, modelName, azureInfo, methodOverride, geminiKey, officeContext, signal, sessionId
);

export { warmUpClient, checkAgentHealth } from './health-prober.js';
