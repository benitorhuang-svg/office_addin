/**
 * Organism/Template: Bridge Orchestrator
 * Bridges the Copilot SDK (v2, protocol 2-3) ↔ Gemini CLI (ACP v1).
 *
 * Key responsibilities:
 *  - Respond to SDK ping with protocolVersion 3 (SDK expects 2-3)
 *  - Convert SDK Record<string,MCPServerConfig> mcpServers → CLI array []
 *  - Track SDK sessionId (UUID) and use it in all session.event notifications
 *  - Forward Gemini CLI streaming updates as SDK session.event notifications
 */
const { log } = require('../atoms/logger');
const state = require('../molecules/state');

// Counter for generating unique CLI-side request IDs
const INITIALIZE_REQUEST_ID = 10001;
let cliIdCounter = INITIALIZE_REQUEST_ID;
function nextCliId() { return ++cliIdCounter; }

class BridgeOrchestrator {
    constructor(sdk, cli) {
        this.sdk = sdk;
        this.cli = cli;
    }

    init() {
        this.sdk.onMessage = (json) => this.handleSdkRequest(json);
        this.cli.onMessage = (json) => this.handleCliMessage(json);
        this.sdk.listen();
        this.cli.spawn();

        // Proactive initialization of Gemini CLI (ACP v1)
        state.acp = 'INITIALIZING';
        this.cli.send('initialize', {
            protocolVersion: 1,
            clientCapabilities: { fs: { roots: [process.cwd().replace(/\\/g, '/')] } }
        }, INITIALIZE_REQUEST_ID);

        log('Wrapper Bridge initialized and listening.');
    }

    // ─── SDK → Bridge ─────────────────────────────────────────────
    handleSdkRequest(json) {
        log(`[BRIDGE] SDK REQ: ${json.method || 'response'} (id:${json.id})`);
        const { method, params, id } = json;
        state.resetActivity();

        // 1. Core protocol handlers (Copilot SDK v2 / ACP 2024)
        if (method === 'ping') {
            return this.sdk.send({
                jsonrpc: "2.0", id,
                result: {
                    protocolVersion: 3,
                    message: "pong",
                    status: "ready",
                    timestamp: Date.now()
                }
            });
        }

        if (method === 'status.get') {
            return this.sdk.send({
                jsonrpc: "2.0", id,
                result: { status: "ready", version: "0.34.0", protocolVersion: 3 }
            });
        }

        if (method === 'auth.getStatus') {
            return this.sdk.send({
                jsonrpc: "2.0", id,
                result: { authenticated: true, user: "gemini-user" }
            });
        }

        // 2. Queue requests until CLI is ready
        if (state.acp !== 'READY') {
            state.pendingRequests.push(json);
            return;
        }

        // 3. session.create — translate SDK format → Gemini CLI session/new
        if (method === 'session.create') {
            const cliId = nextCliId();
            state.idMap.set(cliId, id);
            state.sessionConfig = params;
            // Remember the SDK-side sessionId so events reach the right session
            state.sdkSessionId = params.sessionId || null;

            // Convert mcpServers: SDK uses Record<string, Config>, CLI expects array
            let mcpArray = [];
            if (params.mcpServers && typeof params.mcpServers === 'object' && !Array.isArray(params.mcpServers)) {
                mcpArray = Object.entries(params.mcpServers).map(([name, cfg]) => ({ name, ...cfg }));
            } else if (Array.isArray(params.mcpServers)) {
                mcpArray = params.mcpServers;
            }

            const sessionParams = {
                cwd: (params.workingDirectory || params.cwd || process.cwd()).replace(/\\/g, '/'),
                mcpServers: mcpArray,
                model: params.model || 'gemini-1.5-pro',
                streaming: !!params.streaming
            };
            log(`[BRIDGE] session.create → CLI session/new (cliId:${cliId}, sdkSessionId:${state.sdkSessionId})`);
            return this.cli.send('session/new', sessionParams, cliId);
        }

        // 4. session.send — immediately ACK, then forward prompt to CLI
        if (method === 'session.send') {
            const cliId = nextCliId();
            state.idMap.set(cliId, id);

            // SDK expects { messageId } response for session.send
            this.sdk.send({ jsonrpc: "2.0", id, result: { messageId: `msg-${id}` } });

            // Gemini CLI ACP expects prompt to be an array of parts, not a string.
            const promptParts = Array.isArray(params.prompt)
                ? params.prompt
                : [{ type: 'text', text: String(params.prompt || '') }];

            return this.cli.send('session/prompt', {
                sessionId: state.currentSessionId,
                prompt: promptParts
            }, cliId);
        }

        // 5. session.disconnect / destroy
        if (method === 'session.disconnect' || method === 'session.destroy' || method === 'session/cancel') {
            log(`[BRIDGE] Graceful cleanup: ${method}`);
            if (state.currentSessionId) {
                this.cli.send('session/disconnect', { sessionId: state.currentSessionId }, nextCliId());
            }
            state.setSession(null, null, null);
            state.clearTextBuffer();
            return this.sdk.send({ jsonrpc: "2.0", id, result: { success: true } });
        }

        // Default: forward with ID tracking
        if (id !== undefined) {
            state.idMap.set(id, id);
        }
        this.cli.send(method, params, id);
    }

    // ─── CLI → Bridge ─────────────────────────────────────────────
    handleCliMessage(json) {
        const { id, method, params, result, error } = json;

        // 1. Error forwarding
        if (error) {
            let userError = error;
            if (typeof error.message === 'string' && error.message.includes('API key is missing')) {
                userError = {
                    ...error,
                    message: `${error.message} (建議：請在終端機執行 'gemini auth' 重新登入本機 Google 帳號)`
                };
            }
            log(`[BRIDGE] CLI Error: ${JSON.stringify(userError)}`);
            if (id && state.idMap.has(id)) {
                this.sdk.send({ jsonrpc: "2.0", id: state.idMap.get(id), error: userError });
                state.idMap.delete(id);
            }
            return;
        }

        // 2. Initialization complete → flush queued requests
        if (id === INITIALIZE_REQUEST_ID && result && result.protocolVersion) {
            state.acp = 'READY';
            log(`[BRIDGE] CLI READY (v${result.protocolVersion || '?'}). Flushing ${state.pendingRequests.length} requests.`);
            while (state.pendingRequests.length) {
                this.handleSdkRequest(state.pendingRequests.shift());
            }
            return;
        }

        // 3. session/new response — store CLI session id, reply to SDK
        if (state.idMap.has(id) && result && result.sessionId) {
            state.currentSessionId = result.sessionId;
            const sdkId = state.idMap.get(id);
            state.idMap.delete(id);

            log(`[BRIDGE] CLI session created: ${result.sessionId} → SDK session: ${state.sdkSessionId}`);
            this.sdk.send({
                jsonrpc: "2.0", id: sdkId,
                result: {
                    workspacePath: process.cwd().replace(/\\/g, '/')
                }
            });
            return;
        }

        // 4. Streaming update notifications from CLI
        if (method === 'session/update' && params) {
            this.handleCliUpdate(params.update || params);
            return;
        }

        // 5. Prompt completion from CLI
        if (id !== undefined && state.idMap.has(id)) {
            if (result && (result.stopReason || result.status === 'done')) {
                this.handleCompletion(id, result);
            } else {
                // Other responses — forward to SDK
                const sdkId = state.idMap.get(id);
                state.idMap.delete(id);
                this.sdk.send({ jsonrpc: "2.0", id: sdkId, result });
            }
        }
    }

    // ─── Streaming Chunk Forwarding ──────────────────────────────
    handleCliUpdate(update) {
        const sessionId = state.sdkSessionId;
        if (!sessionId) {
            log('[BRIDGE] Update received but no SDK sessionId tracked; dropping.');
            return;
        }

        const updateType = update.sessionUpdate || update.type;
        const isChunk = [
            'agent_message_chunk',
            'assistant_message_chunk',
            'assistant.message_delta'
        ].includes(updateType);

        if (isChunk) {
            const content = update.content || update.delta || update.data || {};
            const text = content.text || content.deltaContent || content.content || '';
            if (text) {
                state.textBuffer += text;
                this.sendSessionEvent(sessionId, {
                    type: 'assistant.message_delta',
                    data: { deltaContent: text }
                });
            }
            return;
        }

        if (updateType === 'permission_request') {
            const pId = update.permissionId || update.id;
            log(`[BRIDGE] Auto-approving permission: ${pId}`);
            this.cli.send('session/permission', {
                sessionId: state.currentSessionId,
                permissionId: pId,
                outcome: { optionId: 'ProceedOnce' }
            }, nextCliId());
            return;
        }

        log(`[BRIDGE] Update type not handled: ${updateType}`);
    }

    // ─── Completion Handling ─────────────────────────────────────
    handleCompletion(cliId, result) {
        state.idMap.delete(cliId);
        const sessionId = state.sdkSessionId;
        if (!sessionId) return;

        // Send final assistant.message with accumulated text
        const content = state.textBuffer || result.text || result.content || '';
        if (content) {
            this.sendSessionEvent(sessionId, {
                type: 'assistant.message',
                data: { content }
            });
        }

        // Signal idle to resolve sendAndWait()
        this.sendSessionEvent(sessionId, {
            type: 'session.idle',
            data: {}
        });

        state.clearTextBuffer();
    }

    // ─── Helper: send session.event notification to SDK ─────────
    sendSessionEvent(sessionId, event) {
        this.sdk.send({
            jsonrpc: "2.0",
            method: "session.event",
            params: { sessionId, event }
        });
    }
}

module.exports = { BridgeOrchestrator };
