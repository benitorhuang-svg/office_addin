/**
 * Atoms: Socket & Real-time Types
 */
import { NexusPowerState, NexusProvider } from "./enums";

export interface SocketEventMap {
    'SYSTEM_STATE_UPDATED': {
        power?: NexusPowerState;
        provider?: NexusProvider;
        status?: string;
        isStreaming?: boolean;
        /** Live tokens/sec broadcast from the backend after a streaming turn. */
        tokensPerSec?: number;
        /** Time-to-first-token in ms. */
        ttft?: number;
        /** Active persona label. */
        activePersona?: string;
    };
    'COMMAND_EXECUTED': {
        command: string;
        output: string;
        exitCode: number;
    };
    'SET_POWER': { power: NexusPowerState };
    'SET_PROVIDER': { provider: NexusProvider };
    'TELEMETRY_LATENCY': {
        ms?: number;
        latencyMs?: number;
        ttftMs?: number;
        model?: string;
        endpoint?: string;
        method?: string;
        status?: number;
        requestId?: string;
        turnId?: string;
        phase?: string;
    };
    'CHAT_PROGRESS': { text?: string; done?: boolean; progress?: number; status?: string; turnId?: string };
    'PING': Record<string, never>;
    'PONG': Record<string, never>;
}

export type NexusSocketHandler<T extends keyof SocketEventMap> = (payload: SocketEventMap[T]) => void;
