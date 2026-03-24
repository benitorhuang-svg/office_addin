import { CopilotClient, SessionConfig, CopilotSession, CopilotClientOptions, defineTool, Tool } from "@github/copilot-sdk";
import config from '../../../config/molecules/server-config.js';
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
  private static pendingInputs = new Map<string, (response: string) => void>();

  /** 
   * Global way to resolve a pending ask_user request 
   */
  private static readonly MAX_PENDING_INPUTS = 100;

  public static resolveInput(sessionId: string, answer: string): boolean {
    const resolve = this.pendingInputs.get(sessionId);
    if (resolve) {
      resolve(answer);
      this.pendingInputs.delete(sessionId);
      return true;
    }
    return false;
  }

  /**
   * Delegates client creation to the Molecule manager
   */
  private static async getClient(method: ACPConnectionMethod, options: { clientOptions: CopilotClientOptions }): Promise<CopilotClient> {
    return await getOrCreateClient(method, options.clientOptions);
  }

  /**
   * Search tool for background research (High-quality inquiry) 
   * Extracted to avoid redundant definition inside session loop
   */
  private static readonly searchTool: Tool<{ query: string }> = defineTool("google_search", {
    description: "搜尋網路以獲獲最新資訊或精確定義（例如縮寫、專有名詞）。",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string", description: "搜尋關鍵字" }
      },
      required: ["query"]
    },
    handler: async ({ query }) => {
      console.log(`${CORE_SDK_CONFIG.MOCK_ACP_SEARCH_RESULT.substring(0, 20)}: ${query}`);
      // Background knowledge for ACP in this project context
      if (query.toUpperCase().includes("ACP") && query.toUpperCase().includes("COPILOT")) {
        return CORE_SDK_CONFIG.MOCK_ACP_SEARCH_RESULT;
      }
      return CORE_SDK_CONFIG.MOCK_SEARCH_NO_RESULT.replace('{query}', query);
    }
  });

  /**
   * Create session with modern event handling patterns
   */
  private static async createSession(
    client: CopilotClient, 
    sessionOptions: SessionConfig,
    method: ACPConnectionMethod,
    onChunk?: (chunk: string) => void
  ): Promise<{ session: CopilotSession; sessionId: string }> {
    const sessionId = `session-${Date.now()}`;
    
    // Support for interactive ask_user tool and activity hooks
    const sessionOptionsWithHandler: SessionConfig = {
      ...sessionOptions,
      tools: [this.searchTool], // Use centralized tool definition
      hooks: {
        onPreToolUse: async (input) => {
          if (onChunk) {
            // Provide visual feedback during long-running tool calls
            onChunk(`${CORE_SDK_CONFIG.PROGRESS_FEEDBACK_PREFIX}${input.toolName}${CORE_SDK_CONFIG.PROGRESS_FEEDBACK_SUFFIX}`);
          }
        }
      },
      onUserInputRequest: async (request) => {
        console.log(`[SDK V2] AI is asking: ${request.question}`);
        
        // Notify frontend via special chunk format: [ASK_USER]:sessionId:question
        if (onChunk) {
          onChunk(`[ASK_USER]:${sessionId}:${request.question}`);
        }

        // Wait for external resolution (from /api/copilot/response)
        return new Promise((resolve) => {
          this.pendingInputs.set(sessionId, (answer) => {
            resolve({ answer, wasFreeform: true });
          });
          
          // Timeout protection for user response (using config)
          setTimeout(() => {
            if (this.pendingInputs.has(sessionId)) {
              this.pendingInputs.delete(sessionId);
              resolve({ answer: "User did not respond in time.", wasFreeform: true });
            }
          }, CORE_SDK_CONFIG.USER_INPUT_TIMEOUT_MS);

          // Evict oldest entries if map exceeds max size
          if (this.pendingInputs.size > this.MAX_PENDING_INPUTS) {
            const oldest = this.pendingInputs.keys().next().value;
            if (oldest) this.pendingInputs.delete(oldest);
          }
        });
      }
    };

    console.log(`[SDK V2] Creating session with model: ${sessionOptions.model}, streaming: ${sessionOptions.streaming}`);
    
    // Use Promise.race to enforce a timeout on the SDK's JSON-RPC initialization handshake
    // If the spawned CLI agent (e.g. gemini-cli) fails to respond, this prevents endless Node.js deadlocks.
    const createSessionTask = client.createSession(sessionOptionsWithHandler);
    const sessionTimeoutMs = method === 'gemini_cli'
      ? CORE_SDK_CONFIG.GEMINI_CLIENT_START_TIMEOUT_MS
      : CORE_SDK_CONFIG.CLIENT_START_TIMEOUT_MS;
    const sessionTimeout = new Promise<never>((_, reject) => {
      setTimeout(
        () => reject(new Error(`Timeout waiting for Copilot SDK to initialize (JSON-RPC handshake failed after ${Math.round(sessionTimeoutMs / 1000)}s)`)),
        sessionTimeoutMs
      );
    });

    const session = await Promise.race([createSessionTask, sessionTimeout]);
    
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
          this.pendingInputs.delete(sessionId);
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
    methodOverride?: ACPConnectionMethod,
    geminiKey?: string
  ): Promise<string> {
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
        const client = await this.getClient(method, { clientOptions });
        console.log(`[SDK V2 DEBUG] Client received (ready: ${client.getState()})`);
        
        // Use the onEvent hook inside createSession to monitor Gemini activity without breaking types

        const augmentedOptions = {
          ...sessionOptions,
          onEvent: (event: { type: string; data?: Record<string, unknown> }) => {
            console.log(`[SDK V2 Event] ${method}: ${event.type}`);
            if (event.type === 'session.error') {
              console.error(`[SDK V2 Error]`, event.data);
            }
          }
        };

        const { session, sessionId } = await this.createSession(client, augmentedOptions, method, onChunk);

        // Manual turn management with Inactivity Watchdog
        // This bypasses the unreliable session.idle event and its 60s timeout
        const result = await new Promise<string>((resolve, reject) => {
          let fullContent = '';
          const INACTIVITY_MS = CORE_SDK_CONFIG.WATCHDOG_INACTIVITY_MS; 
          let inactivityWatcher: NodeJS.Timeout | null = null;
          
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
            if (inactivityWatcher) clearTimeout(inactivityWatcher);
            clearTimeout(globalTimeout);
            const sessionData = this.sessions.get(sessionId);
            if (sessionData) {
              sessionData.cleanup();
              this.sessions.delete(sessionId);
            }
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

        // Force cleanup and restart client for next attempt
        try {
          // Access the underlying client-manager via our static method (assuming we updated it)
          await stopAllClients(); 
        } catch {}

        if (retryCount > maxRetries) {
          const fallbackText = `${CORE_SDK_CONFIG.ERROR_SDK_CONNECTION_FAIL} (方式：${method})。\n\n錯誤詳情：${errorMessage}`;
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
    
    for (const [sessionId, sessionData] of this.sessions.entries()) {
      try {
        sessionData.cleanup();
        await sessionData.session.disconnect();
      } catch (e) {
        console.warn(`[SDK V2] Cleanup error for ${sessionId}:`, e);
      }
      this.sessions.delete(sessionId);
    }
    this.sessions.clear();
    this.pendingInputs.clear();

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
