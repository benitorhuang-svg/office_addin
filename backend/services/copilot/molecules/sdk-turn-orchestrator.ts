import { CORE_SDK_CONFIG } from '../atoms/core-config.js';
import type { ACPConnectionMethod, ACPSessionConfig } from '../atoms/types.js';
import crypto from 'node:crypto';
import { extractResponseText } from '../atoms/formatters.js';
import { resolveACPOptions } from './option-resolver.js';
import { getOrCreateClient } from './client-manager.js';
import { generateSessionId, createSession, cleanupSession } from './session-lifecycle.js';
import { AdaptiveWatchdog } from './adaptive-watchdog.js';
import { NexusSocketRelay } from '../../molecules/nexus-socket.js';
import { GlobalSystemState } from '../../molecules/system-state-store.js';
import type { CopilotSession, SessionEvent } from '@github/copilot-sdk';
import { logger } from '../../../core/atoms/logger.js';

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
    const originalOnEvent = sessionOptions.onEvent;

    const augmentedOptions = {
      ...sessionOptions,
      onEvent: (event: SessionEvent) => {
        try {
          originalOnEvent?.(event);
        } catch (originalHandlerError) {
          logger.warn('SdkTurn', 'Original session onEvent handler threw', {
            sessionId,
            eventType: event.type,
            error: originalHandlerError,
          });
        }

        if (event.type === 'session.error') {
          logger.error('SdkTurn', 'Received session error event during turn setup', {
            sessionId,
            eventType: event.type,
            data: event.data,
          });
        }
      }
    };

    const { session } = await createSession(
      client,
      augmentedOptions,
      method,
      sessionId,
      onChunk,
      signal,
      acpConfig.officeContext,
    );

    const turnId = crypto.randomUUID();

    return new Promise<string>((resolve, reject) => {
      let fullContent = '';
      let finished = false; // Guard: prevent finish() from firing more than once
      const INACTIVITY_MS = AdaptiveWatchdog.getTimeout(modelName);
      let inactivityWatcher: NodeJS.Timeout | null = null;
      const turnStartTime = performance.now();
      const unsubscribeHandlers: Array<() => void> = [];

      const onAbort = () => {
        finish(new DOMException('The operation was aborted', 'AbortError'));
      };
      if (signal) signal.addEventListener('abort', onAbort);

      const globalTimeout = setTimeout(() => {
        finish(new Error(`[Fatal Timeout] AI Response time exceeded ${CORE_SDK_CONFIG.GEN_TIMEOUT_MS / 1000}s`));
      }, CORE_SDK_CONFIG.GEN_TIMEOUT_MS);

      const ping = () => {
        if (inactivityWatcher) clearTimeout(inactivityWatcher);
        inactivityWatcher = setTimeout(() => {
          logger.warn('SdkTurn', 'Watchdog finished idle session', {
            sessionId,
            inactivityMs: INACTIVITY_MS,
            model: modelName,
          });
          finish();
        }, INACTIVITY_MS);
      };

      const finish = (err?: Error) => {
        if (finished) return; // SDK spec: each turn must resolve/reject exactly once
        finished = true;

        if (signal) signal.removeEventListener('abort', onAbort);
        if (inactivityWatcher) clearTimeout(inactivityWatcher);
        clearTimeout(globalTimeout);
        while (unsubscribeHandlers.length > 0) {
          const unsubscribe = unsubscribeHandlers.pop();
          try {
            unsubscribe?.();
          } catch (unsubscribeError) {
            logger.warn('SdkTurn', 'Failed to unsubscribe session listener', {
              sessionId,
              error: unsubscribeError,
            });
          }
        }
        
        const latencyMs = Math.round(performance.now() - turnStartTime);
        if (!err) {
          AdaptiveWatchdog.recordLatency(modelName, latencyMs);
          NexusSocketRelay.broadcast('TELEMETRY_LATENCY', {
            ms: latencyMs,
            model: modelName,
            turnId,
            phase: 'turn',
          });
        }

        GlobalSystemState.update({ isStreaming: false });
        NexusSocketRelay.broadcast('SYSTEM_STATE_UPDATED', GlobalSystemState.getState());
        cleanupSession(sessionId);
        void session.disconnect().catch((disconnectError) => {
          logger.warn('SdkTurn', 'Failed to disconnect session cleanly', {
            sessionId,
            error: disconnectError,
          });
        });

        if (err) reject(err);
        else resolve(fullContent.trim() || extractResponseText({}));
      };

      // Set up listeners
      unsubscribeHandlers.push(
        ...this.wireSessionEvents(session, sessionId, modelName, turnStartTime, turnId, (delta) => {
          fullContent += delta;
          if (onChunk) onChunk(delta);
          ping();
        }, (isReasoning) => {
          if (isReasoning) ping();
        }, () => ping())
      );

      // Fast finish on idle
      unsubscribeHandlers.push(session.on("session.idle", () => {
        if (fullContent.length > 0) {
          setTimeout(() => finish(), 1000);
        }
      }));

      // Error handling
      unsubscribeHandlers.push(session.on("session.error", (event: SessionEvent) => {
        const errorEvent = event as SessionEvent & {
          message?: string;
          data?: {
            message?: string;
          };
        };
        const errMsg = errorEvent.data?.message || errorEvent.message || String(event);
        if (errMsg.includes("60000ms") && (errMsg.includes("session.idle") || errMsg.includes("idle"))) {
          return;
        }
        finish(new Error(errMsg));
      }));

      ping();
      NexusSocketRelay.broadcast('TELEMETRY_LATENCY', {
        ms: 0,
        model: modelName,
        turnId,
        phase: 'turn-start',
      });
      session.send({ prompt }).catch((err: Error) => finish(err));
    });
  }

  private static wireSessionEvents(
    session: CopilotSession,
    _sessionId: string,
    modelName: string,
    startTime: number,
    turnId: string,
    onDelta: (delta: string) => void,
    onReasoning: (isReasoning: boolean) => void,
    onPing: () => void
  ): Array<() => void> {
    let ttftRecorded = false;
    const unsubscribeHandlers: Array<() => void> = [];

    // SDK spec: use typed event shape ??data.deltaContent for streaming deltas
    type SdkEvent = { data?: { deltaContent?: string; content?: string } };

    unsubscribeHandlers.push(session.on("assistant.message_delta", (event: SdkEvent) => {
      const delta = event.data?.deltaContent || event.data?.content || '';
      if (delta) {
        if (!ttftRecorded) {
          const ttftMs = Math.round(performance.now() - startTime);
          NexusSocketRelay.broadcast('TELEMETRY_LATENCY', {
            ms: ttftMs,
            ttftMs,
            model: modelName,
            turnId,
            phase: 'ttft',
          });
          ttftRecorded = true;
        }
        onDelta(delta);
      }
    }));

    unsubscribeHandlers.push(session.on("assistant.reasoning_delta", (event: SdkEvent) => {
      const delta = event.data?.deltaContent || event.data?.content || '';
      if (delta) {
        // [COT]: Pipe reasoning to client with special marker for UI mapping
        onDelta(`[THOUGHT]: ${delta}`);
        onReasoning(true);
      }
    }));

    unsubscribeHandlers.push(session.on("assistant.message", (event: SdkEvent) => {
      if (event.data?.content) onDelta(''); // trigger activity ping
    }));
    unsubscribeHandlers.push(session.on("tool.execution_start", () => onPing()));

    return unsubscribeHandlers;
  }
}
