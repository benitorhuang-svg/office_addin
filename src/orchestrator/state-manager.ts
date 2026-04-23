/**
 * Global State Manager
 * Handles the shared state and context memory for the multi-agent team.
 */

import { randomUUID } from "crypto";

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
  };
  history: AgentAction[];
  activePlan?: string[];
  currentTask?: string;
  status: "idle" | "planning" | "executing" | "reviewing" | "completed" | "error";
  error?: string;
}

class StateManager {
  private states = new Map<string, GlobalAgentState>();

  createState(sessionId: string, initialContext: GlobalAgentState["context"] = {}): GlobalAgentState {
    const state: GlobalAgentState = {
      sessionId,
      context: initialContext,
      history: [],
      status: "idle",
    };
    this.states.set(sessionId, state);
    return state;
  }

  getState(sessionId: string): GlobalAgentState | undefined {
    return this.states.get(sessionId);
  }

  updateState(sessionId: string, updates: Partial<GlobalAgentState>): GlobalAgentState {
    const state = this.states.get(sessionId);
    if (!state) throw new Error(`State not found for session ${sessionId}`);
    
    Object.assign(state, updates);
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
    return newAction;
  }

  clearState(sessionId: string) {
    this.states.delete(sessionId);
  }
}

export const globalStateManager = new StateManager();
