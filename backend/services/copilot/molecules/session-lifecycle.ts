import crypto from 'crypto';
import { CopilotClient } from "@github/copilot-sdk";
import type { CopilotSession, SessionConfig } from "@github/copilot-sdk";
import type { ACPConnectionMethod } from '../atoms/types.js';
import { CORE_SDK_CONFIG } from '../atoms/core-config.js';
import { handleCopilotPermissionRequest } from '../atoms/permission-policy.js';
import { applyLeastPrivilegeToolSurface } from '../atoms/tool-surface-policy.js';
import { getSessionTools } from './tool-registry.js';
import { waitForUserInput, deletePendingInput } from './pending-input-queue.js';
import type { OfficeContext } from '../atoms/types.js';
import { logger } from '../../../core/atoms/logger.js';

/**
 * Molecule: Session Lifecycle Manager
 * Handles session creation, event wiring, and cleanup for Copilot SDK sessions.
 */

interface ManagedSession {
  session: CopilotSession;
  cleanup: () => void;
}

const activeSessions = new Map<string, ManagedSession>();

type SessionTool = NonNullable<SessionConfig['tools']>[number];

function mergeSessionTools(sessionOfficeContext?: OfficeContext, sessionTools?: SessionTool[]): SessionTool[] {
  const merged = new Map<string, SessionTool>();

  for (const tool of getSessionTools(sessionOfficeContext)) {
    merged.set(tool.name, tool);
  }

  for (const tool of sessionTools ?? []) {
    merged.set(tool.name, tool);
  }

  return Array.from(merged.values());
}

export function generateSessionId(): string {
  return crypto.randomUUID();
}

export async function createSession(
  client: CopilotClient,
  sessionOptions: SessionConfig,
  method: ACPConnectionMethod,
  sessionId: string,
  onChunk?: (chunk: string) => void,
  signal?: AbortSignal,
  officeContext?: OfficeContext,
): Promise<{ session: CopilotSession; sessionId: string }> {
  let sessionTimeout: ReturnType<typeof setTimeout> | undefined;
  const originalPreToolUse = sessionOptions.hooks?.onPreToolUse;
  const originalUserInputRequest = sessionOptions.onUserInputRequest;
  const toolSurface = applyLeastPrivilegeToolSurface(sessionOptions);
  const augmentedOptions: SessionConfig = {
    ...sessionOptions,
    clientName: sessionOptions.clientName || 'nexus-center-office-addin',
    workingDirectory: sessionOptions.workingDirectory || process.cwd(),
    sessionId,
    ...toolSurface,
    onPermissionRequest: sessionOptions.onPermissionRequest || handleCopilotPermissionRequest,
    tools: mergeSessionTools(officeContext, sessionOptions.tools),
    hooks: {
      ...sessionOptions.hooks,
      onPreToolUse: async (input, invocation) => {
        if (onChunk) {
          onChunk(`${CORE_SDK_CONFIG.PROGRESS_FEEDBACK_PREFIX}${input.toolName}${CORE_SDK_CONFIG.PROGRESS_FEEDBACK_SUFFIX}`);
        }

        return originalPreToolUse?.(input, invocation);
      }
    },
    onUserInputRequest: async (request, invocation) => {
      if (originalUserInputRequest) {
        return originalUserInputRequest(request, invocation);
      }
      return waitForUserInput(sessionId, request.question, onChunk, signal);
    }
  };

  logger.info('SDKSession', 'Creating Copilot SDK session', {
    sessionId,
    method,
    clientName: augmentedOptions.clientName,
    workingDirectory: augmentedOptions.workingDirectory,
    availableTools: augmentedOptions.availableTools,
    model: sessionOptions.model,
    streaming: sessionOptions.streaming,
  });

  const sessionTimeoutMs = method === 'gemini_cli'
    ? CORE_SDK_CONFIG.GEMINI_CLIENT_START_TIMEOUT_MS
    : CORE_SDK_CONFIG.CLIENT_START_TIMEOUT_MS;

  try {
    const session = await Promise.race([
      client.createSession(augmentedOptions),
      new Promise<never>((_, reject) => {
        sessionTimeout = setTimeout(
          () => reject(new Error(`Timeout waiting for Copilot SDK to initialize (JSON-RPC handshake failed after ${Math.round(sessionTimeoutMs / 1000)}s)`)),
          sessionTimeoutMs
        );
      })
    ]) as CopilotSession;

    activeSessions.set(sessionId, {
      session,
      cleanup: () => {
        deletePendingInput(sessionId);
      }
    });

    return { session, sessionId };
  } finally {
    if (sessionTimeout) {
      clearTimeout(sessionTimeout);
    }
  }
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
  logger.info('SDKSession', 'Cleaning up all active sessions', { count: activeSessions.size });
  for (const [sessionId, sessionData] of activeSessions.entries()) {
    try {
      sessionData.cleanup();
      await sessionData.session.disconnect();
    } catch (e) {
      logger.warn('SDKSession', 'Failed during session cleanup', { sessionId, error: e });
    }
    activeSessions.delete(sessionId);
  }
  activeSessions.clear();
}
