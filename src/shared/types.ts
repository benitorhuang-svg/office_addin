/**
 * Atom: Core Types & Interfaces
 * Unified domain models for the Nexus Center ecosystem.
 */
import { NexusPowerState, NexusProvider, SocketEvent } from "@shared/enums.js";
import type { Language } from "@shared/locales.js";

export { NexusPowerState, NexusProvider, SocketEvent };
export type { Language };

/**
 * Common Authentication Status Bridge
 */
export interface AuthStatusProxy {
    setStatus: (msg: string) => void;
    showSuccess: (type: string, msg: string) => void;
    showOnboarding: (msg?: string) => void;
    notifyAssistant: (msg: string, isStory?: boolean, animate?: boolean) => void;
}

export interface OfficeContextPayload {
    selectedText: string;
    surroundingContent?: string;
    fileName?: string;
    host?: string;
    selectionRange?: string;
    fullBody?: string;
}

export type AuthMode = "pat" | "oauth" | "azure" | "none" | "preview";

/**
 * UI Context for Authentication Portal
 */
export interface AuthUIContext {
    authStatusEl: HTMLElement | null;
    applyStatusEl: HTMLElement | null;
    historyEl: HTMLElement | null;
}

/**
 * Socket Handler Type
 */
export type NexusSocketHandler<T> = (data: T) => void;

export interface HeaderProps {
    authProvider?: NexusProvider | null;
    online?: boolean;
    onClearChat?: () => void;
    onLogout?: () => void;
    onGoHome?: () => void;
}

/**
 * Atomic Action: Office Document Manipulation
 */
export interface OfficeAction {
    type: string;
    text?: string;
    icon?: string;
    value?: string;
    title?: string;
    chartType?: string;
    range?: string;
    metadata?: Record<string, unknown>;
    
    // Formatting Atoms
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    fontSize?: number;
    fontColor?: string;
    fontName?: string;
    alignment?: "Left" | "Centered" | "Right" | "Justified" | string;
    level?: number;
    
    // Rich Media & Structural Atoms
    imageUrl?: string;
    base64Image?: string;
    items?: string[];
    rows?: string[][];
    headers?: string[];
    
    // Position & Section Specific Atoms
    pageNumberPosition?: "top" | "bottom" | "current";
    lineNumberPosition?: "left" | "right";
    highlightColor?: string;
}

/**
 * Atomic State: Universal UI State for Nexus
 */
export interface NexusState {
    power: NexusPowerState;
    provider: NexusProvider;
    latency: number;
    isStreaming: boolean;
    isServerConnected: boolean;
    language: Language;
    lastError: string | null;
    selectedModel?: string;
    uplinkMode: 'CLI' | 'ACP';
    attachments?: string[];
    enabledAttachments?: string[];
    isExcelActive?: boolean;
    /** Live tokens-per-second telemetry from the last streaming turn. */
    tokensPerSec?: number;
    /** Time-to-first-token in milliseconds; -1 when unavailable. */
    ttft?: number;
    /** Active persona / preset label (e.g. "Excel Data Scientist"). */
    activePersona?: string;
}

/**
 * Organism Level Component Interface
 */
export interface NexusComponent {
    element: HTMLElement;
    destroy?: () => void;
    update?: (props: unknown) => void;
    clear?: () => void;
}

/**
 * Chat Context for UI Interactions
 */
export interface ChatContext {
    historyEl: HTMLElement | null;
    promptEl: HTMLTextAreaElement | null;
    sendBtn: HTMLButtonElement | null;
    applyStatus?: HTMLElement | null;
    responseEl?: HTMLElement | null;
    runtimeModel?: HTMLElement | null;
    selectedModel?: string;
    presetId?: string;
}

export interface SocketEventMap {
    [SocketEvent.SYSTEM_STATE_UPDATED]: { power?: NexusPowerState; provider?: NexusProvider; status?: string; isStreaming?: boolean };
    [SocketEvent.CHAT_PROGRESS]: { text?: string; done?: boolean; progress?: number; status?: string; turnId?: string };
    [SocketEvent.TELEMETRY_LATENCY]: {
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
    [SocketEvent.SET_POWER]: { on: boolean };
    [SocketEvent.SET_PROVIDER]: { provider: NexusProvider };
    [SocketEvent.EXCEL_CHART_EXTERNAL]: { title: string; chartType: string; range: string; index?: number };
    [SocketEvent.PING]: Record<string, unknown>;
    [SocketEvent.PONG]: Record<string, unknown>;
}

export interface WritingPreset {
    id: string;
    label: string;
    description: string;
    prompt: string;
}

export interface ServerConfig {
    AVAILABLE_MODELS_GITHUB: string[];
    AVAILABLE_MODELS_GEMINI: string[];
    APP_TITLE?: string;
    AUTO_CONNECT_CLI?: boolean;
}

export interface CopilotResponse {
    text: string;
    actions: OfficeAction[];
    model?: string;
}

export type AuthController = {
    initialize: (mode: AuthMode) => Promise<void>;
    getAccessToken: () => Promise<string | null>;
    getGeminiToken: () => Promise<string | null>;
    getAuthProvider: () => string;
    checkInitialAuth: () => Promise<void>;
    login: () => Promise<void>;
    logout: () => Promise<void>;
    bindButtons: (btns: Record<string, HTMLElement | null>) => void;
    handleUnauthorized: () => void;
}

/**
 * Represents one entry in the vector embedding index.
 * Persisted to src/agents/skills/output/vector_index.json.
 */
export interface VectorIndexEntry {
    /** SHA-256 hex digest of the source text */
    hash: string;
    /** Gemini text-embedding-004 vector (768-dim) */
    embedding: number[];
    /** Unix epoch seconds when this embedding was last computed */
    timestamp: number;
}
