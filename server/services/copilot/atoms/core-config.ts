import config from '../../../config/env.js';

/**
 * Atom: Core SDK behavior constants
 * Ensures the 300s timeout is centralized.
 */
export const CORE_SDK_CONFIG = {
  // Global internal SDK timeout for session.sendAndWait
  GEN_TIMEOUT_MS: 300000, // 5 minutes (300 seconds)
  
  // Default CLI method if nothing else matches
  DEFAULT_METHOD: 'copilot_cli' as const,
  
  // Default Remote Agent Port
  DEFAULT_REMOTE_PORT: config.COPILOT_AGENT_PORT || '17817',
  
  // Azure default API version
  AZURE_API_VERSION: config.AZURE_OPENAI_API_VERSION || '2024-10-21',
};
