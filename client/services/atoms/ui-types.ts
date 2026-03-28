/**
 * Atoms: UI Component & Auth Lifecycle Types
 */

import { AuthMode } from "./types";
import { NexusPowerState, NexusProvider } from "./enums";

export interface AuthControllerCallbacks {
    onAuthStateChanged?: () => void;
}

export interface AuthController {
    initialize: (mode: AuthMode) => void;
    checkInitialAuth: () => void;
    logout: () => void;
    getAccessToken: () => Promise<string | null>;
    getGeminiToken: () => Promise<string | null>;
    getAuthProvider: () => string;
    bindButtons: (btns: Record<string, HTMLElement | null>) => void;
    handleUnauthorized: () => void;
}

export interface ChatContext {
    historyEl: HTMLElement | null;
    applyStatus: HTMLElement | null;
    promptEl: HTMLTextAreaElement | null;
    sendBtn: HTMLButtonElement | null;
    responseEl: HTMLElement | null;
    runtimeModel: HTMLElement | null;
    presetId?: string;
    selectedModel?: string;
}

export interface AuthUIContext {
  authStatusEl: HTMLElement | null;
  applyStatusEl: HTMLElement | null;
  historyEl: HTMLElement | null;
}

export type NexusUIMode = 'welcome' | 'chat' | 'monitor' | 'offline';

export interface NexusComponent {
    element: HTMLElement;
    destroy?: () => void;
}

export interface NexusState {
    power: NexusPowerState;
    provider: NexusProvider;
    latency: number;
    isStreaming: boolean;
    isServerConnected: boolean;
    lastError: string | null;
}
