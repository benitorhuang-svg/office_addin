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
    };
    'COMMAND_EXECUTED': {
        command: string;
        output: string;
        exitCode: number;
    };
    'SET_POWER': { power: NexusPowerState };
    'SET_PROVIDER': { provider: NexusProvider };
    'TELEMETRY_LATENCY': { latencyMs: number, model: string };
    'CHAT_PROGRESS': { progress: number, status: string };
    'PING': Record<string, never>;
    'PONG': Record<string, never>;
}

export type NexusSocketHandler<T extends keyof SocketEventMap> = (payload: SocketEventMap[T]) => void;
