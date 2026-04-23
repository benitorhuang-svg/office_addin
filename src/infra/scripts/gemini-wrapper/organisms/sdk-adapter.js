/**
 * Organism: SDK Adapter
 * High-level orchestrator for the Copilot SDK interaction.
 */
const { log } = require('../atoms/logger');
const { encodeLspFrame, parseAutoFrame } = require('../atoms/protocol');

class SDKAdapter {
    constructor() {
        this.stdinBuffer = Buffer.alloc(0);
        this.onMessage = null; // Callback for parsed JSON messages
    }

    listen() {
        process.stdin.on('data', (chunk) => {
            log(`[SDK] IN (Raw): ${chunk.toString().substring(0, 100)}...`);
            this.stdinBuffer = Buffer.concat([this.stdinBuffer, chunk]);
            
            while (true) {
                const prevLength = this.stdinBuffer.length;
                this.stdinBuffer = parseAutoFrame(this.stdinBuffer, (json) => {
                    log(`[SDK] IN (Parsed): ${json.method || 'response'} (id:${json.id})`);
                    if (this.onMessage) this.onMessage(json);
                });
                
                if (this.stdinBuffer.length === prevLength || this.stdinBuffer.length === 0) break;
            }
        });

        process.on('uncaughtException', (error) => {
            log(`[SDK] Uncaught exception: ${error.message}`);
            process.exit(1);
        });

        return this;
    }

    send(json) {
        const frame = encodeLspFrame(json);
        process.stdout.write(frame);
        log(`[SDK] OUT: ${json.method || 'response'} (id:${json.id})`);
        return true;
    }
}

module.exports = { SDKAdapter };
