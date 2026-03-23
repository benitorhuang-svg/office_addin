/**
 * Molecule: State Management
 * Persistent state for the bridge.
 */

const STATE = {
    acp: 'INIT', // INIT, INITIALIZING, READY
    currentSessionId: null, // CLI-side session id from gemini-cli
    sdkSessionId: null,     // SDK-side session id (UUID from Copilot SDK)
    textBuffer: "",
    idMap: new Map(), // Mapping CLI IDs → SDK IDs for responses
    pendingRequests: [],
    sessionConfig: null,
    lastActivity: Date.now(),
    messageCount: 0,

    resetActivity() {
        this.lastActivity = Date.now();
        this.messageCount++;
    },

    setSession(cliId, sdkId, config) {
        this.currentSessionId = cliId;
        this.sdkSessionId = sdkId;
        this.sessionConfig = config;
    },

    clearTextBuffer() {
        this.textBuffer = "";
    }
};

module.exports = STATE;
