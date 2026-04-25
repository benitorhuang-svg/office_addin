/**
 * Global State Manager
 * Handles the shared state and context memory for the multi-agent team.
 * 🟠 6. Optimized with TTL cleanup to prevent memory leaks.
 */

import { randomUUID, createHash } from "node:crypto";
import { logger } from "@shared/logger/index.js";

const TAG = "StateManager";
const DEFAULT_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours

export interface AgentAction {
  id: string;
  agent: string;
  action: string;
  payload: unknown;
  result?: unknown;
  timestamp: number;
}

export interface GlobalAgentState {
  sessionId: string;
  context: {
    documentText?: string;
    activeSheet?: string;
    selectionData?: unknown;
    host?: string;
    /** P3: Hash of the last successfully synced context to support Delta-updates */
    contextHash?: string;
  };
  history: AgentAction[];
  activePlan?: string[];
  currentTask?: string;
  status: "idle" | "planning" | "executing" | "reviewing" | "completed" | "error";
  /** P3: Real-time progress percentage (0-100) */
  progress?: number;
  /** P3: Granular status detail (e.g., "Rendering Slide 5/12") */
  subStatus?: string;
  error?: string;
  lastAccessed: number; // For TTL
}

class StateManager {
  private states = new Map<string, GlobalAgentState>();
  private cleanupTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.startCleanupTimer();
  }

  /** P3: Compute hash of context to detect changes */
  static computeContextHash(context: unknown): string {
    const serialized = JSON.stringify(context);
    return createHash("md5").update(serialized).digest("hex");
  }

  private startCleanupTimer() {
    // Run cleanup every 30 minutes
    this.cleanupTimer = setInterval(
      () => {
        this.cleanupExpiredStates();
      },
      30 * 60 * 1000
    );
    this.cleanupTimer.unref(); // Don't block process exit
  }

  private cleanupExpiredStates() {
    const now = Date.now();
    let count = 0;
    for (const [sessionId, state] of this.states.entries()) {
      if (now - state.lastAccessed > DEFAULT_TTL_MS) {
        this.states.delete(sessionId);
        count++;
      }
    }
    if (count > 0) {
      logger.info(TAG, `Cleaned up ${count} expired agent states.`);
    }
  }

  createState(
    sessionId: string,
    initialContext: GlobalAgentState["context"] = {}
  ): GlobalAgentState {
    const state: GlobalAgentState = {
      sessionId,
      context: initialContext,
      history: [],
      status: "idle",
      lastAccessed: Date.now(),
    };
    this.states.set(sessionId, state);
    return state;
  }

  getState(sessionId: string): GlobalAgentState | undefined {
    const state = this.states.get(sessionId);
    if (state) {
      state.lastAccessed = Date.now(); // Sliding window TTL
    }
    return state;
  }

  updateState(sessionId: string, updates: Partial<GlobalAgentState>): GlobalAgentState {
    const state = this.states.get(sessionId);
    if (!state) throw new Error(`State not found for session ${sessionId}`);

    Object.assign(state, updates);
    state.lastAccessed = Date.now();
    return state;
  }

  recordAction(sessionId: string, action: Omit<AgentAction, "id" | "timestamp">): AgentAction {
    const state = this.states.get(sessionId);
    if (!state) throw new Error(`State not found for session ${sessionId}`);

    const newAction: AgentAction = {
      id: randomUUID(),
      timestamp: Date.now(),
      ...action,
    };

    state.history.push(newAction);
    state.lastAccessed = Date.now();
    return newAction;
  }

  clearState(sessionId: string) {
    this.states.delete(sessionId);
  }
}

export const globalStateManager = new StateManager();
