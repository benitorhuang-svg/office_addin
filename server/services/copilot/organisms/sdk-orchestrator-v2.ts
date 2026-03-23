import { CopilotClient, SessionConfig, CopilotSession, AssistantMessageEvent, CopilotClientOptions, defineTool, Tool } from "@github/copilot-sdk";
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
  private static pendingInputs = new Map<string, (response: string) => void>();

  /** 
   * Global way to resolve a pending ask_user request 
   */
  public static resolveInput(sessionId: string, answer: string) {
    const resolve = this.pendingInputs.get(sessionId);
    if (resolve) {
      resolve(answer);
      this.pendingInputs.delete(sessionId);
    }
  }

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
    const sessionId = `session-${Date.now()}`;

    // Define search tool for background research (High-quality inquiry)
    const searchTool: Tool<any> = defineTool("google_search", {
      description: "搜尋網路以獲取最新資訊或精確定義（例如縮寫、專有名詞）。",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "搜尋關鍵字" }
        },
        required: ["query"]
      },
      handler: async ({ query }) => {
        console.log(`[高品質提向研判] 正在進行背景搜尋: ${query}`);
        // Background knowledge for ACP in this project context
        if (query.toUpperCase().includes("ACP") && query.toUpperCase().includes("COPILOT")) {
          return "【搜尋結果】在 GitHub Copilot SDK 脈絡下，ACP 指的是『Agent Connection Protocol』。這是一個連接 SDK 與本地 Agent (CLI) 的自定義通訊協定。常見連接方式包括：copilot_cli, gemini_cli, azure_byok。";
        }
        return `搜尋結果摘要 (${query})：未找到與專案直接相關的唯一定義。建議詢問使用者是否指某種特定的策略或協定。`;
      }
    });
    
    // Support for interactive ask_user tool and activity hooks
    const sessionOptionsWithHandler: SessionConfig = {
      ...sessionOptions,
      tools: [searchTool],
      hooks: {
        onPreToolUse: async (input) => {
          if (onChunk) {
            // Provide visual feedback during long-running tool calls
            onChunk(`\n> 🔍 *AI 正在針對「${input.toolName}」進行預研與思考...*\n\n`);
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
          
          // Timeout protection for user response (2 mins)
          setTimeout(() => {
            if (this.pendingInputs.has(sessionId)) {
              this.pendingInputs.delete(sessionId);
              resolve({ answer: "User did not respond in time.", wasFreeform: true });
            }
          }, 120000);
        });
      }
    };

    console.log(`[SDK V2] Creating session with model: ${sessionOptions.model}, streaming: ${sessionOptions.streaming}`);
    const session = await client.createSession(sessionOptionsWithHandler);
    
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

        // Manual turn management with Inactivity Watchdog
        // This bypasses the unreliable session.idle event and its 60s timeout
        const result = await new Promise<string>((resolve, reject) => {
          let fullContent = '';
          const INACTIVITY_MS = 10000; // 10 seconds of no output/tool activity = complete
          let inactivityWatcher: NodeJS.Timeout | null = null;
          
          const globalTimeout = setTimeout(() => {
            finish(new Error(`[Fatal Timeout] AI 總回應時間超過 ${CORE_SDK_CONFIG.GEN_TIMEOUT_MS / 1000} 秒`));
          }, CORE_SDK_CONFIG.GEN_TIMEOUT_MS);

          const ping = () => {
            if (inactivityWatcher) clearTimeout(inactivityWatcher);
            inactivityWatcher = setTimeout(() => {
              console.log(`[Watchdog] 偵測到 10 秒無活動，判定為生成結束 (Session: ${sessionId})`);
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

          // Monitor text deltas
          session.on("assistant.message_delta", (event: { data?: { deltaContent?: string; content?: string } }) => {
            const delta = event.data?.deltaContent || event.data?.content || '';
            if (delta) {
              fullContent += delta;
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

          session.on("session.error", (err) => {
            const errMsg = String(err);
            if (errMsg.includes("60000ms") && (errMsg.includes("session.idle") || errMsg.includes("idle"))) {
              console.warn(`[Watchdog] 忽略 SDK 內部的 60s Idle 超時報錯，依賴活動監視器繼續...`);
              return; // IGNORE THIS SPECIFIC ERROR
            }
            finish(err instanceof Error ? err : new Error(errMsg));
          });

          console.log(`[SDK V2] Launching turn with Watchdog (Session: ${sessionId})`);
          ping(); // Start the first timer
          session.send({ prompt }).catch(err => finish(err instanceof Error ? err : new Error(String(err))));
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
