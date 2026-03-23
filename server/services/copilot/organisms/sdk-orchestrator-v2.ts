import { CopilotClient, SessionConfig, CopilotSession, AssistantMessageEvent, CopilotClientOptions } from "@github/copilot-sdk";
import config from '../../../config/env.js';
import { CORE_SDK_CONFIG } from '../atoms/core-config.js';
import { ACPConnectionMethod, AzureInfo, ACPSessionConfig } from '../atoms/types.js';
import { extractResponseText } from '../atoms/formatters.js';
import { resolveMethodFromContext, resolveACPOptions } from '../molecules/option-resolver.js';

/**
 * Organism V2: Modern SDK Orchestrator with Best Practices
 * Based on GitHub Copilot SDK 0.2.0+ patterns and official examples
 */
import { getOrCreateClient, stopAllClients } from '../molecules/client-manager.js';

/**
 * Organism V2: Modern SDK Orchestrator with Best Practices
 * Based on GitHub Copilot SDK 0.2.0+ patterns and official examples
 */
export class ModernSDKOrchestrator {
  private static sessions = new Map<string, { session: CopilotSession; cleanup: () => void }>();

  /**
   * Delegates client creation to the Molecule manager
   */
  private static async getClient(method: ACPConnectionMethod, options: { clientOptions: CopilotClientOptions }): Promise<CopilotClient> {
    return await getOrCreateClient(method, options.clientOptions);
  }

  /**
   * Create session with modern event handling patterns
   */
  private static async createSession(
    client: CopilotClient, 
    sessionOptions: SessionConfig,
    onChunk?: (chunk: string) => void
  ): Promise<{ session: CopilotSession; sessionId: string }> {
    const session = await client.createSession(sessionOptions);
    const sessionId = `session-${Date.now()}`;
    
    if (onChunk && sessionOptions.streaming) {
      // Modern event subscription pattern
      const unsubscribeMessageDelta = session.on("assistant.message_delta", (event: { data?: { deltaContent?: string; content?: string } }) => {
        const delta = event.data?.deltaContent || event.data?.content || '';
        console.log(`[SDK V2] Delta received (${delta.length} chars)`);
        if (delta) {
          onChunk(delta);
        }
      });

      const unsubscribeIdle = session.on("session.idle", () => {
        console.log(`[SDK V2] Session ${sessionId} is idle`);
      });

      // Store cleanup functions
      this.sessions.set(sessionId, {
        session,
        cleanup: () => {
          unsubscribeMessageDelta();
          unsubscribeIdle();
        }
      });
    }

    return { session, sessionId };
  }

  /**
   * Send prompt with modern error handling and retry logic
   */
  public static async sendPrompt(
    prompt: string,
    _token: string,
    onChunk?: (chunk: string) => void,
    isExplicitCli: boolean = false,
    modelName: string = config.COPILOT_MODEL,
    azureInfo?: AzureInfo,
    methodOverride?: ACPConnectionMethod
  ): Promise<string> {
    const method = methodOverride || resolveMethodFromContext(modelName, azureInfo, isExplicitCli);
    console.log(`[SDK V2] Using method: ${method}, model: ${modelName}, streaming: ${!!onChunk}`);

    const acpConfig: ACPSessionConfig = {
      method,
      model: modelName,
      streaming: !!onChunk,
      azure: azureInfo,
      remotePort: config.COPILOT_AGENT_PORT || undefined,
    };

    let retryCount = 0;
    const maxRetries = 1; // Faster failover

    while (retryCount <= maxRetries) {
      try {
        const { clientOptions, sessionOptions } = resolveACPOptions(acpConfig);
        const client = await this.getClient(method, { clientOptions });
        const { session, sessionId } = await this.createSession(client, sessionOptions, onChunk);

        if (onChunk && sessionOptions.streaming) {
          // Streaming mode with timeout protection
          const response = (await Promise.race([
            session.sendAndWait({ prompt }),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Stream timeout')), CORE_SDK_CONFIG.GEN_TIMEOUT_MS)
            )
          ])) as AssistantMessageEvent;

          const finalText = extractResponseText(response);
          
          // Cleanup session
          const sessionData = this.sessions.get(sessionId);
          if (sessionData) {
            sessionData.cleanup();
            this.sessions.delete(sessionId);
          }

          try { await session.disconnect(); } catch {}
          return finalText || "";
        } else {
          // Non-streaming mode
          const response = (await session.sendAndWait({ prompt })) as AssistantMessageEvent;
          const text = extractResponseText(response);
          
          try { await session.disconnect(); } catch {}
          return text;
        }

      } catch (error: unknown) {
        retryCount++;
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`[SDK V2] Attempt ${retryCount}/${maxRetries + 1} failed:`, errorMessage);

        if (retryCount > maxRetries) {
          const fallbackText = `SDK V2 連接失敗 (方式：${method})。\n\n錯誤詳情：${errorMessage}`;
          if (onChunk) onChunk(fallbackText);
          return fallbackText;
        }

        await new Promise(resolve => setTimeout(resolve, 500 * retryCount));
      }
    }

    return 'Unexpected error in retry loop';
  }

  /**
   * Cleanup all clients and sessions
   */
  public static async cleanup(): Promise<void> {
    console.log('[SDK V2] Cleaning up all sessions...');
    
    for (const [_sessionId, sessionData] of this.sessions.entries()) {
      try {
        sessionData.cleanup();
        await sessionData.session.disconnect();
      } catch {}
    }
    this.sessions.clear();

    await stopAllClients();
  }

  /**
   * Health check for all active clients
   */
  public static async healthCheck(): Promise<Record<string, boolean>> {
    const health: Record<string, boolean> = {};
    return health; // Stubbed for now as molecules handle health
  }
}
