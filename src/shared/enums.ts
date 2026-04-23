/**
 * Shared: Global Error Codes
 * D1: Standardized snake_case error codes for consistent handling.
 */

export enum ErrorCode {
  // Security
  UNAUTHORIZED = 'UNAUTHORIZED_ACCESS',
  FORBIDDEN = 'FORBIDDEN_ACTION',
  INVALID_TOKEN = 'INVALID_AUTH_TOKEN',

  // Performance & Limits
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  TIMEOUT = 'REQUEST_TIMEOUT',
  OOM_PROTECTION = 'OOM_PROTECTION_TRIGGERED',

  // Provider / AI
  PROVIDER_ERROR = 'AI_PROVIDER_ERROR',
  LLM_VALIDATION_FAILED = 'LLM_OUTPUT_INVALID',
  EMPTY_RESPONSE = 'EMPTY_AI_RESPONSE',

  // Office / Domain
  OFFICE_HOST_UNAVAILABLE = 'OFFICE_HOST_UNAVAILABLE',
  FILE_NOT_FOUND = 'FILE_NOT_FOUND',
  DATA_TRANSFORM_FAILED = 'DATA_TRANSFORM_FAILED',

  // System
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_SYSTEM_ERROR',
}

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

