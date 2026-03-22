const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const PROTOCOL = require('./lib/protocol.js');
const HANDLERS = require('./lib/handlers.js');

const logFile = path.join(__dirname, 'gemini-wrapper.log');
const log = (msg) => fs.appendFileSync(logFile, `[${new Date().toISOString()}] ${msg}\n`);

log('--- Wrapper starting (Atomized V4) ---');

const repoRoot = path.resolve(__dirname, '..');
const geminiScript = path.join(repoRoot, 'node_modules', '@google', 'gemini-cli', 'dist', 'index.js');

if (!fs.existsSync(geminiScript)) {
    log(`ERROR: Gemini CLI not found at ${geminiScript}`);
    process.exit(1);
}

// ─── Process State ──────────────────────────────────────────
const state = {
    acp: 'INIT',      // INIT -> INITIALIZING -> READY
    currentSessionId: null,
    textBuffer: "",
    idMap: new Map(), // SDK ID mapping
    pending: []       // Quoted requests
};

// ─── Spawn Gemini CLI ───────────────────────────────────────
const child = spawn(process.execPath, [geminiScript, '--acp', '-y'], {
    stdio: ['pipe', 'pipe', 'pipe'],
    cwd: repoRoot,
    env: { ...process.env, NODE_ENV: 'production' }
});

child.stderr.on('data', (d) => log(`CLI STDERR: ${d.toString()}`));

// ─── Outbound Utils ─────────────────────────────────────────
function sendToSDK(json) {
    process.stdout.write(PROTOCOL.createContentLengthFrame(json));
}

function sendToCLI(method, params, id) {
    const body = JSON.stringify({ jsonrpc: "2.0", id, method, params });
    child.stdin.write(body + '\n'); // Gemini CLI uses NDJSON inbound
    log(`WRAPPER -> CLI: ${method} (id:${id})`);
}

// ─── SDK Input handling ────────────────────────────────────
let sdkBuffer = Buffer.alloc(0);
process.stdin.on('data', (c) => {
    sdkBuffer = Buffer.concat([sdkBuffer, c]);
    sdkBuffer = PROTOCOL.parseInputBuffer(sdkBuffer, handleSdkRequest);
});

function handleSdkRequest(json) {
    const { method, params, id } = json;

    if (method === 'ping') {
        return sendToSDK({ jsonrpc: "2.0", id, result: { protocolVersion: 3, message: "pong" } });
    }

    if (state.acp !== 'READY') {
        state.pending.push(json);
        if (state.acp === 'INIT') {
            state.acp = 'INITIALIZING';
            sendToCLI('initialize', { protocolVersion: 1 }, 10001);
        }
        return;
    }

    if (method === 'session.create') {
        state.idMap.set(10003, id);
        return sendToCLI('session/new', { cwd: repoRoot.replace(/\\/g, '/') }, 10003);
    }

    if (method === 'session.send') {
        return HANDLERS.handlePromptRequest(params.prompt, id, state, sendToCLI, sendToSDK);
    }

    // INTERCEPT: session/cancel crash fix
    if (method === 'session.destroy' || method === 'session/cancel') {
        log(`Intercepted ${method} to prevent CLI crash.`);
        return sendToSDK({ jsonrpc: "2.0", id, result: { success: true } });
    }

    sendToCLI(method, params, id);
}

// ─── CLI Output handling ────────────────────────────────────
let cliBuffer = Buffer.alloc(0);
child.stdout.on('data', (c) => {
    cliBuffer = Buffer.concat([cliBuffer, c]);
    cliBuffer = PROTOCOL.parseInputBuffer(cliBuffer, handleCliMessage);
});

function handleCliMessage(json) {
    const { id, method, params, result, error } = json;

    if (error) {
        log(`CLI ERROR: ${JSON.stringify(error)}`);
        return;
    }

    // 1. Lifecycle: Shake -> SessionNew -> READY
    if (id === 10001 && result) {
        state.acp = 'READY';
        log('CLI READY. Flushing queue.');
        while (state.pending.length) handleSdkRequest(state.pending.shift());
        return;
    }

    if (id === 10003 && result && result.sessionId) {
        state.currentSessionId = result.sessionId;
        const sdkId = state.idMap.get(10003);
        return sendToSDK({ jsonrpc: "2.0", id: sdkId, result: { sessionId: "acp-session" } });
    }

    // 2. Event Routing: Updates & Completions
    if (method === 'session/update' && params) {
        return HANDLERS.handleCliUpdate(params.update, state, sendToCLI, sendToSDK);
    }

    if (id !== undefined && state.idMap.has(id)) {
        if (result && result.stopReason) {
             // Dispatch final assistant.message event
             sendToSDK({
                 jsonrpc: "2.0", method: "session.event",
                 params: { sessionId: "acp-session", event: { type: "assistant.message", data: { content: state.textBuffer } } }
             });
             sendToSDK({
                 jsonrpc: "2.0", method: "session.event",
                 params: { sessionId: "acp-session", event: { type: "session.idle", data: {} } }
             });
             state.textBuffer = "";
             state.idMap.delete(id);
        }
    }
}

// ─── Cleanup ───────────────────────────────────────────────
process.on('SIGTERM', () => { log('Wrapper SIGTERM. Killing child...'); child.kill(); });
process.on('SIGINT', () => { log('Wrapper SIGINT. Killing child...'); child.kill(); });
