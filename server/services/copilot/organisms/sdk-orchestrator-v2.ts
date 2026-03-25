import config from '../../../config/molecules/server-config.js';
import { CORE_SDK_CONFIG } from '../atoms/core-config.js';
import { ACPConnectionMethod, AzureInfo, ACPSessionConfig } from '../atoms/types.js';
import { extractResponseText } from '../atoms/formatters.js';
import { resolveMethodFromContext, resolveACPOptions } from '../molecules/option-resolver.js';
import { getOrCreateClient, stopAllClients } from '../molecules/client-manager.js';
import { resolveInput as resolveInputFromQueue, clearAllPendingInputs } from '../molecules/pending-input-queue.js';
import { generateSessionId, createSession, cleanupSession, cleanupAllSessions } from '../molecules/session-lifecycle.js';
import { AdaptiveWatchdog } from '../molecules/adaptive-watchdog.js';

/**
 * Organism V2: Modern SDK Orchestrator
 * Thin facade that delegates to specialized molecules:
 *   - tool-registry (tool definitions)
 *   - pending-input-queue (interactive ask_user flow)
 *   - session-lifecycle (session creation, events, cleanup)
 *   - client-manager (connection pooling)
 */
export class ModernSDKOrchestrator {
  public static resolveInput(sessionId: string, answer: string): boolean {
    return resolveInputFromQueue(sessionId, answer);
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
    methodOverride?: ACPConnectionMethod,
    geminiKey?: string,
    signal?: AbortSignal
  ): Promise<string> {
    if (signal?.aborted) return '';
    console.log(`[SDK V2 DEBUG] Entering sendPrompt. Prompt length: ${prompt.length}, isExplicitCli: ${isExplicitCli}, methodOverride: ${methodOverride}`);
    const method = methodOverride || resolveMethodFromContext(modelName, azureInfo, isExplicitCli);
    console.log(`[SDK V2 DEBUG] Resolved method: ${method}, model: ${modelName}, streaming: ${!!onChunk}`);

    const acpConfig: ACPSessionConfig = {
      method,
      model: modelName,
      streaming: !!onChunk,
      azure: azureInfo,
      remotePort: config.COPILOT_AGENT_PORT || undefined,
      geminiKey
    };

    let retryCount = 0;
    const maxRetries = CORE_SDK_CONFIG.MAX_SDK_RETRIES; // From config

    while (retryCount <= maxRetries) {
      try {
        const { clientOptions, sessionOptions } = resolveACPOptions(acpConfig);
        console.log(`[SDK V2 DEBUG] Options resolved. Requesting client from manager...`);
        const client = await getOrCreateClient(method, clientOptions);
        console.log(`[SDK V2 DEBUG] Client received (ready: ${client.getState()})`);

        const augmentedOptions = {
          ...sessionOptions,
          onEvent: (event: { type: string; data?: Record<string, unknown> }) => {
            console.log(`[SDK V2 Event] ${method}: ${event.type}`);
            if (event.type === 'session.error') {
              console.error(`[SDK V2 Error]`, event.data);
            }
          }
        };

        const sessionId = generateSessionId();
        const { session } = await createSession(client, augmentedOptions, method, sessionId, onChunk);

        // Manual turn management with Inactivity Watchdog
        // This bypasses the unreliable session.idle event and its 60s timeout
        const result = await new Promise<string>((resolve, reject) => {
          let fullContent = '';
          const INACTIVITY_MS = AdaptiveWatchdog.getTimeout(modelName);
          console.log(`[Watchdog] Using adaptive timeout: ${INACTIVITY_MS/1000}s for model "${modelName}"`);
          let inactivityWatcher: NodeJS.Timeout | null = null;
          const promptStartTime = performance.now();
          
          const onAbort = () => {
            console.log(`[SDK V2] Abortion signal received for session ${sessionId}`);
            finish(new Error('Aborted by client'));
          };
          if (signal) signal.addEventListener('abort', onAbort);

          const globalTimeout = setTimeout(() => {
            finish(new Error(`[Fatal Timeout] AI 總回應時間超過 ${CORE_SDK_CONFIG.GEN_TIMEOUT_MS / 1000} 秒`));
          }, CORE_SDK_CONFIG.GEN_TIMEOUT_MS);

          const ping = () => {
            if (inactivityWatcher) clearTimeout(inactivityWatcher);
            inactivityWatcher = setTimeout(() => {
              console.log(`[Watchdog] No activity for ${INACTIVITY_MS/1000}s, finishing (Session: ${sessionId})`);
              finish();
            }, INACTIVITY_MS);
          };

          const finish = (err?: Error) => {
            if (signal) signal.removeEventListener('abort', onAbort);
            if (inactivityWatcher) clearTimeout(inactivityWatcher);
            clearTimeout(globalTimeout);
            const latencyMs = Math.round(performance.now() - promptStartTime);
            if (!err) AdaptiveWatchdog.recordLatency(modelName, latencyMs);
            cleanupSession(sessionId);
            session.disconnect().catch(() => {});
            if (err) reject(err);
            else resolve(fullContent.trim() || extractResponseText({}));
          };

          // Treat any session activity as a signal to keep the watchdog alive.
          session.on((event: { type: string }) => {
            if (event.type !== 'session.idle' && event.type !== 'session.error') {
              ping();
            }
          });

          // Monitor text deltas (streaming)
          session.on("assistant.message_delta", (event: { data?: { deltaContent?: string; content?: string } }) => {
            const delta = event.data?.deltaContent || event.data?.content || '';
            if (delta) {
              fullContent += delta;
              ping(); // ACTIVITY DETECTED
            }
          });

          // Capture final assistant.message (non-streaming fallback or final assembled response)
          session.on("assistant.message", (event: { data?: { content?: string; messageId?: string } }) => {
            const content = event.data?.content || '';
            console.log(`[SDK V2] Final assistant.message received (${content.length} chars, Session: ${sessionId})`);
            if (content) {
              // If we already have streaming deltas, skip the final (it's a duplicate).
              // If no deltas were received, use this as the full response.
              if (!fullContent) {
                fullContent = content;
                if (onChunk) onChunk(content);
              }
              ping(); // ACTIVITY DETECTED
            }
          });

          // Also monitor tool execution as activity
          session.on("tool.execution_start", () => ping());

          // We still keep idle as a FAST finish trigger, but we wrap it in a TRY to ignore SDK errors
          session.on("session.idle", () => {
            console.log(`[SDK V2] Session IDLE signal received (Session: ${sessionId})`);
            ping(); // Reset for safety
            if (fullContent.length > 0) {
               // If we have content, we can finish faster than the watchdog
               setTimeout(() => finish(), 1000); 
            }
          });

          session.on("session.error", (event: { data?: { message?: string; code?: string }; message?: string } | Error) => {
            // Extract error message from SDK event object or Error instance
            let errMsg: string;
            if (event instanceof Error) {
              errMsg = event.message;
            } else {
              errMsg = event?.data?.message || event?.message || JSON.stringify(event);
            }
            console.error(`[SDK V2] Session error (${sessionId}):`, errMsg);

            if (errMsg.includes("60000ms") && (errMsg.includes("session.idle") || errMsg.includes("idle"))) {
              console.warn(`[Watchdog] 忽略 SDK 內部的 60s Idle 超時報錯，依賴活動監視器繼續...`);
              return; // IGNORE THIS SPECIFIC ERROR
            }
            finish(new Error(errMsg));
          });

          console.log(`[SDK V2] Launching turn with Watchdog (Session: ${sessionId})`);
          ping(); // Start the first timer
          session.send({ prompt })
            .then((messageId) => {
              console.log(`[SDK V2] Prompt accepted (Session: ${sessionId}, Message: ${messageId})`);
            })
            .catch(err => finish(err instanceof Error ? err : new Error(String(err))));
        });

        return result;

      } catch (error: unknown) {
        retryCount++;
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`[SDK V2] Attempt ${retryCount}/${maxRetries + 1} failed:`, errorMessage);

        // Force granular cleanup for ONLY the erroring client parameters
        try {
          const { clientOptions: retryOptions } = resolveACPOptions(acpConfig);
          const { removeClientByParams } = await import('../molecules/client-manager.js');
          await removeClientByParams(method, retryOptions); 
        } catch (cleanupErr) {
          console.warn(`[SDK V2 Cleanup Error]`, cleanupErr);
        }

        if (retryCount > maxRetries) {
          const fallbackText = `${CORE_SDK_CONFIG.ERROR_SDK_CONNECTION_FAIL} (方式：${method})。\n\n錯誤詳情：${errorMessage}`;
          if (onChunk) onChunk(fallbackText);
          return fallbackText;
        }

        const delay = Math.min(500 * Math.pow(2, retryCount), 5000); 
        console.log(`[SDK V2] Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    return 'Unexpected error in retry loop';
  }

  /**
   * Cleanup all clients and sessions
   */
  public static async cleanup(): Promise<void> {
    await cleanupAllSessions();
    clearAllPendingInputs();
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
