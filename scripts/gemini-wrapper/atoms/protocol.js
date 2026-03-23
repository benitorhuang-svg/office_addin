/**
 * Atom: Protocol Parser
 * Dual parser for LSP-style (SDK) and NDJSON-style (CLI).
 */
const { log } = require('./logger');

function parseLspFrame(buffer, onMessage) {
    let nextBuffer = buffer;
    const str = nextBuffer.toString('utf8');
    const clMatch = str.match(/Content-Length: (\d+)\r\n\r\n/);
    
    if (clMatch) {
        const length = parseInt(clMatch[1], 10);
        const headerStr = clMatch[0];
        const headerOffset = str.indexOf(headerStr);
        const bodyOffset = headerOffset + headerStr.length;
        
        if (nextBuffer.length >= bodyOffset + length) {
            const body = nextBuffer.slice(bodyOffset, bodyOffset + length).toString('utf8');
            nextBuffer = nextBuffer.slice(bodyOffset + length);
            try { 
                onMessage(JSON.parse(body)); 
            } catch (e) { 
                log(`[PROTOCOL] JSON parse error (LSP): ${e.message}`);
            }
        }
    }
    return nextBuffer;
}

function parseNdJsonFrame(buffer, onMessage) {
    let nextBuffer = buffer;
    const str = nextBuffer.toString('utf8');
    const newlineIndex = str.indexOf('\n');
    
    if (newlineIndex !== -1) {
        const line = str.substring(0, newlineIndex).trim();
        nextBuffer = nextBuffer.slice(Buffer.byteLength(str.substring(0, newlineIndex + 1), 'utf8'));
        
        if (line) {
            try {
                onMessage(JSON.parse(line));
            } catch (e) {
                log(`[PROTOCOL] JSON parse error (NDJSON): ${e.message}`);
            }
        }
    } else if (str.trim().startsWith('{') && str.trim().endsWith('}')) {
        try {
            onMessage(JSON.parse(str.trim()));
            nextBuffer = Buffer.alloc(0);
        } catch (e) { }
    }
    return nextBuffer;
}

function parseAutoFrame(buffer, onMessage) {
    const str = buffer.toString('utf8').trim();
    if (!str) return buffer;

    if (str.startsWith('Content-Length:')) {
        return parseLspFrame(buffer, onMessage);
    }
    if (str.startsWith('{')) {
        return parseNdJsonFrame(buffer, onMessage);
    }
    return buffer;
}

function encodeLspFrame(json) {
    const body = JSON.stringify(json);
    return `Content-Length: ${Buffer.byteLength(body, 'utf8')}\r\n\r\n${body}`;
}

function encodeNdJsonFrame(json) {
    return JSON.stringify(json) + '\n';
}

module.exports = {
    parseLspFrame,
    parseNdJsonFrame,
    parseAutoFrame,
    encodeLspFrame,
    encodeNdJsonFrame
};
