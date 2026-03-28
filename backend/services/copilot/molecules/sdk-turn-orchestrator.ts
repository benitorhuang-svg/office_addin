import config from '../../../config/molecules/server-config.js';
import { CORE_SDK_CONFIG } from '../atoms/core-config.js';
import { ACPConnectionMethod, AzureInfo, ACPSessionConfig } from '../atoms/types.js';
import { extractResponseText } from '../atoms/formatters.js';
import { resolveACPOptions } from './option-resolver.js';
import { getOrCreateClient } from './client-manager.js';
import { generateSessionId, createSession, cleanupSession } from './session-lifecycle.js';
import { AdaptiveWatchdog } from './adaptive-watchdog.js';
import { NexusSocketRelay } from '../../molecules/nexus-socket.js';
import { CopilotSession } from '@github/copilot-sdk';

/**
 * Molecule: SDK Turn Orchestrator
 * Handles the lifecycle of a single AI turn: Session creation, Event streaming, and Watchdog monitoring.
 */
export class SdkTurnOrchestrator {
  public static async executeTurn(
    prompt: string,
    modelName: string,
    method: ACPConnectionMethod,
    acpConfig: ACPSessionConfig,
    onChunk?: (chunk: string) => void,
    signal?: AbortSignal
  ): Promise<string> {
    const { clientOptions, sessionOptions } = resolveACPOptions(acpConfig);
    const client = await getOrCreateClient(method, clientOptions);
    const sessionId = generateSessionId();

    const augmentedOptions = {
      ...sessionOptions,
      onEvent: (event: any) => {
        if (event.type === 'session.error') {
          console.error(`[SDK Turn Error] ${sessionId}:`, event.data);
        }
      }
    };

    const { session } = await createSession(client, augmentedOptions, method, sessionId, onChunk);

    return new Promise<string>((resolve, reject) => {
      let fullContent = '';
      const INACTIVITY_MS = AdaptiveWatchdog.getTimeout(modelName);
      let inactivityWatcher: NodeJS.Timeout | null = null;
      const turnStartTime = performance.now();
      let ttftRecorded = false;

      const onAbort = () => {
        finish(new Error('Aborted by client'));
      };
      if (signal) signal.addEventListener('abort', onAbort);

      const globalTimeout = setTimeout(() => {
        finish(new Error(`[Fatal Timeout] AI Response time exceeded ${CORE_SDK_CONFIG.GEN_TIMEOUT_MS / 1000}s`));
      }, CORE_SDK_CONFIG.GEN_TIMEOUT_MS);

      const ping = () => {
        if (inactivityWatcher) clearTimeout(inactivityWatcher);
        inactivityWatcher = setTimeout(() => {
          console.log(`[Watchdog] No activity for ${INACTIVITY_MS/1000}s, finishing session ${sessionId}`);
          finish();
        }, INACTIVITY_MS);
      };

      const finish = (err?: Error) => {
        if (signal) signal.removeEventListener('abort', onAbort);
        if (inactivityWatcher) clearTimeout(inactivityWatcher);
        clearTimeout(globalTimeout);
        
        const latencyMs = Math.round(performance.now() - turnStartTime);
        if (!err) {
          AdaptiveWatchdog.recordLatency(modelName, latencyMs);
        }

        NexusSocketRelay.broadcast('SYSTEM_STATE_UPDATED', { isStreaming: false });
        cleanupSession(sessionId);
        session.disconnect().catch(() => {});

        if (err) reject(err);
        else resolve(fullContent.trim() || extractResponseText({}));
      };

      // Set up listeners
      this.wireSessionEvents(session, sessionId, modelName, turnStartTime, (delta) => {
        fullContent += delta;
        if (onChunk) onChunk(delta);
        ping();
      }, (isReasoning) => {
        if (isReasoning) ping();
      }, () => ping());

      // Fast finish on idle
      session.on("session.idle", () => {
        if (fullContent.length > 0) {
          setTimeout(() => finish(), 1000);
        }
      });

      // Error handling
      session.on("session.error", (event: any) => {
        const errMsg = event?.data?.message || event?.message || String(event);
        if (errMsg.includes("60000ms") && (errMsg.includes("session.idle") || errMsg.includes("idle"))) {
          return;
        }
        finish(new Error(errMsg));
      });

      ping();
      session.send({ prompt }).catch(err => finish(err));
    });
  }

  private static wireSessionEvents(
    session: CopilotSession,
    _sessionId: string,
    modelName: string,
    startTime: number,
    onDelta: (delta: string) => void,
    onReasoning: (isReasoning: boolean) => void,
    onPing: () => void
  ) {
    let ttftRecorded = false;

    session.on("assistant.message_delta", (event: any) => {
      const delta = event.data?.deltaContent || event.data?.content || '';
      if (delta) {
        if (!ttftRecorded) {
          const ttftMs = Math.round(performance.now() - startTime);
          NexusSocketRelay.broadcast('TELEMETRY_LATENCY', { model: modelName, latencyMs: 0, ttftMs });
          ttftRecorded = true;
        }
        onDelta(delta);
      }
    });

    session.on("assistant.reasoning_delta", (event: any) => {
      const delta = event.data?.deltaContent || event.data?.content || '';
      if (delta) {
        // [COT]: Pipe reasoning to client with special marker for UI mapping
        onDelta(`[THOUGHT]: ${delta}`);
        onReasoning(true);
      }
    });

    session.on("assistant.message", (event: any) => {
      const content = event.data?.content || '';
      if (content) onDelta(''); // Just trigger activity
    });
    session.on("tool.execution_start", () => onPing());
  }
}
