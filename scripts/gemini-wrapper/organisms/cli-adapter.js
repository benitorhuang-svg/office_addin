/**
 * Organism: CLI Adapter
 * High-level orchestrator for the spawned Gemini CLI.
 */
const { spawn } = require('child_process');
const path = require('path');
const { log } = require('../atoms/logger');
const { encodeNdJsonFrame, parseNdJsonFrame } = require('../atoms/protocol');

const repoRoot = path.resolve(__dirname, '../../../');
const geminiScript = path.join(repoRoot, 'node_modules', '@google', 'gemini-cli', 'dist', 'index.js');

class CLIAdapter {
    constructor() {
        this.child = null;
        this.stdoutBuffer = Buffer.alloc(0);
        this.onMessage = null; // Callback for parsed JSON messages
    }

    spawn() {
        this.child = spawn(process.execPath, [geminiScript, '--acp', '-y'], {
            stdio: ['pipe', 'pipe', 'pipe'],
            cwd: repoRoot,
            env: { 
                ...process.env, 
                NODE_ENV: 'production',
                GEMINI_CLI_LOG_LEVEL: 'error'
            }
        });

        this.child.stderr.on('data', (d) => {
            const errorMsg = d.toString().trim();
            if (!errorMsg.includes('DeprecationWarning')) {
                log(`[CLI] STDERR: ${errorMsg}`);
            }
        });

        this.child.stdout.on('data', (chunk) => {
            log(`[CLI] IN: ${chunk.toString().trim()}`);
            this.stdoutBuffer = Buffer.concat([this.stdoutBuffer, chunk]);
            
            while (true) {
                const prevLength = this.stdoutBuffer.length;
                this.stdoutBuffer = parseNdJsonFrame(this.stdoutBuffer, (json) => {
                    if (this.onMessage) this.onMessage(json);
                });
                
                if (this.stdoutBuffer.length === prevLength || this.stdoutBuffer.length === 0) break;
            }
        });

        this.child.on('close', (code) => {
            log(`[CLI] Process exited with code ${code}`);
        });

        return this.child;
    }

    send(method, params, id) {
        if (!this.child || this.child.killed) {
            log(`[CLI] FAILED SEND: Process not running`);
            return false;
        }
        
        const frame = { jsonrpc: "2.0", id, method, params };
        this.child.stdin.write(encodeNdJsonFrame(frame));
        log(`[CLI] OUT: ${method} (id:${id})`);
        return true;
    }

    stop() {
        if (this.child && !this.child.killed) {
            this.child.kill('SIGTERM');
        }
    }
}

module.exports = { CLIAdapter };
