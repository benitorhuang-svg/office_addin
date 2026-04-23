/**
 * Atom: Socket Configuration
 * Centralized constants for WebSocket lifecycle and retry logic.
 */
export const SOCKET_CONFIG = {
    BASE_RETRY_MS: 1000,
    MAX_RETRY_MS: 30000,
    HEARTBEAT_MS: 30000,
    COMMAND_QUEUE_LIMIT: 50,
    PROBE_TIMEOUT_MS: 3000
};
