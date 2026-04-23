/**
 * Atom: Constants & Enums
 * Pure immutable grounding for the Nexus Center ecosystem.
 */

export enum NexusPowerState {
    ON = "ON",
    OFF = "OFF",
    STANDBY = "STANDBY",
    WORKING = "WORKING"
}

export enum NexusProvider {
    // Standard Providers
    COPILOT_CLI = "copilot_cli",
    COPILOT_PAT = "copilot_pat",
    COPILOT_OAUTH = "copilot_oauth",
    COPILOT_SDK = "copilot_sdk",
    GEMINI_CLI = "gemini_cli",
    GEMINI_API = "gemini_api",
    AZURE_OPENAI = "azure_openai",
    AZURE_BYOK = "azure_byok",
    GITHUB_MODELS = "github_models",
    PREVIEW = "preview",
    
    // Internal/Fallback States
    REMOTE_CLI = "remote_cli",
    NONE = "none"
}

export enum SocketEvent {
    SYSTEM_STATE_UPDATED = "SYSTEM_STATE_UPDATED",
    COMMAND_EXECUTED = "COMMAND_EXECUTED",
    SET_POWER = "SET_POWER",
    SET_PROVIDER = "SET_PROVIDER",
    TELEMETRY_LATENCY = "TELEMETRY_LATENCY",
    CHAT_PROGRESS = "CHAT_PROGRESS",
    EXCEL_CHART_EXTERNAL = "EXCEL_CHART_EXTERNAL",
    PING = "PING",
    PONG = "PONG"
}
