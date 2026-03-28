import config from '../../../config/molecules/server-config.js';
import { ACPConnectionMethod, AzureInfo, ACPSessionConfig } from '../atoms/types.js';
import { resolveMethodFromContext } from '../molecules/option-resolver.js';
import { stopAllClients } from '../molecules/client-manager.js';
import { clearAllPendingInputs, resolveInput as resolveInputFromQueue } from '../molecules/pending-input-queue.js';
import { cleanupAllSessions } from '../molecules/session-lifecycle.js';
import { NexusSocketRelay } from '../../molecules/nexus-socket.js';
import { SdkTurnOrchestrator } from '../molecules/sdk-turn-orchestrator.js';
import { SdkRetryEngine } from '../molecules/sdk-retry-engine.js';

/**
 * Organism: Modern SDK Orchestrator (Refactored)
 * Coordinates high-level AI tasks by delegating to specialized Molecules:
 *   - SdkTurnOrchestrator: Manages session turn execution.
 *   - SdkRetryEngine: Manages retry-on-failure protocols.
 */
export class ModernSDKOrchestrator {
  public static resolveInput(sessionId: string, answer: string): boolean {
    return resolveInputFromQueue(sessionId, answer);
  }

  /**
   * Main entry point for sending prompts via GitHub Copilot SDK.
   */
  public static async sendPrompt(
    prompt: string,
    _token: string,
    onChunk?: (chunk: string) => void,
    isExplicitCli: boolean = false,
    modelName: string = config.COPILOT_MODEL,
    azureInfo?: AzureInfo,
    methodOverride?: ACPConnectionMethod,
    geminiKey?: string,
    signal?: AbortSignal
  ): Promise<string> {
    if (signal?.aborted) return '';
    
    const method = methodOverride || resolveMethodFromContext(modelName, azureInfo, isExplicitCli);
    NexusSocketRelay.broadcast('SYSTEM_STATE_UPDATED', { isStreaming: true });

    const acpConfig: ACPSessionConfig = {
      method,
      model: modelName,
      streaming: !!onChunk,
      azure: azureInfo,
      remotePort: config.COPILOT_AGENT_PORT || undefined,
      geminiKey
    };

    // Orchestrate execution via specialized molecules
    const result = await SdkRetryEngine.executeWithRetry(
      () => SdkTurnOrchestrator.executeTurn(prompt, modelName, method, acpConfig, onChunk, signal),
      method,
      acpConfig,
      onChunk
    );

    return result as string;
  }

  public static async cleanup(): Promise<void> {
    await cleanupAllSessions();
    clearAllPendingInputs();
    await stopAllClients();
  }

  public static async healthCheck(): Promise<Record<string, boolean>> {
    return {}; // Logic delegated to molecules
  }
}
