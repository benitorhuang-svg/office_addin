import { CopilotClient, CopilotSession, SessionConfig } from "@github/copilot-sdk";
import { ACPConnectionMethod } from '../atoms/types.js';
import { CORE_SDK_CONFIG } from '../atoms/core-config.js';
import { getSessionTools } from './tool-registry.js';
import { waitForUserInput, deletePendingInput } from './pending-input-queue.js';

/**
 * Molecule: Session Lifecycle Manager
 * Handles session creation, event wiring, and cleanup for Copilot SDK sessions.
 */

interface ManagedSession {
  session: CopilotSession;
  cleanup: () => void;
}

const activeSessions = new Map<string, ManagedSession>();

import crypto from 'crypto';

export function generateSessionId(): string {
  return crypto.randomUUID();
}

export async function createSession(
  client: CopilotClient,
  sessionOptions: SessionConfig,
  method: ACPConnectionMethod,
  sessionId: string,
  onChunk?: (chunk: string) => void
): Promise<{ session: CopilotSession; sessionId: string }> {
  const augmentedOptions: SessionConfig = {
    ...sessionOptions,
    tools: getSessionTools(),
    hooks: {
      onPreToolUse: async (input) => {
        if (onChunk) {
          onChunk(`${CORE_SDK_CONFIG.PROGRESS_FEEDBACK_PREFIX}${input.toolName}${CORE_SDK_CONFIG.PROGRESS_FEEDBACK_SUFFIX}`);
        }
      }
    },
    onUserInputRequest: async (request) => {
      return waitForUserInput(sessionId, request.question, onChunk);
    }
  };

  console.log(`[SDK V2] Creating session with model: ${sessionOptions.model}, streaming: ${sessionOptions.streaming}`);

  const sessionTimeoutMs = method === 'gemini_cli'
    ? CORE_SDK_CONFIG.GEMINI_CLIENT_START_TIMEOUT_MS
    : CORE_SDK_CONFIG.CLIENT_START_TIMEOUT_MS;

  const session = await Promise.race([
    client.createSession(augmentedOptions),
    new Promise<never>((_, reject) => {
      setTimeout(
        () => reject(new Error(`Timeout waiting for Copilot SDK to initialize (JSON-RPC handshake failed after ${Math.round(sessionTimeoutMs / 1000)}s)`)),
        sessionTimeoutMs
      );
    })
  ]);

  if (onChunk && sessionOptions.streaming) {
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

    activeSessions.set(sessionId, {
      session,
      cleanup: () => {
        unsubscribeMessageDelta();
        unsubscribeIdle();
        deletePendingInput(sessionId);
      }
    });
  }

  return { session, sessionId };
}

export function getActiveSession(sessionId: string): ManagedSession | undefined {
  return activeSessions.get(sessionId);
}

export function cleanupSession(sessionId: string): void {
  const sessionData = activeSessions.get(sessionId);
  if (sessionData) {
    sessionData.cleanup();
    activeSessions.delete(sessionId);
  }
}

export async function cleanupAllSessions(): Promise<void> {
  console.log('[SDK V2] Cleaning up all sessions...');
  for (const [sessionId, sessionData] of activeSessions.entries()) {
    try {
      sessionData.cleanup();
      await sessionData.session.disconnect();
    } catch (e) {
      console.warn(`[SDK V2] Cleanup error for ${sessionId}:`, e);
    }
    activeSessions.delete(sessionId);
  }
  activeSessions.clear();
}
