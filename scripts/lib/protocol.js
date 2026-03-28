/**
 * Atom: ACP/JSON-RPC Message Protocol
 * Handles framing (Content-Length) and line-based parsing. 
 */

// const LOG_PREFIX = '[Protocol]';

function createContentLengthFrame(json) {
    const body = JSON.stringify(json);
    return `Content-Length: ${Buffer.byteLength(body, 'utf8')}\r\n\r\n${body}`;
}

function parseInputBuffer(buffer, onMessage) {
    let nextBuffer = buffer;
    while (true) {
        const str = nextBuffer.toString('utf8');
        
        // Match Content-Length frame
        const clMatch = str.match(/Content-Length: (\d+)\r\n\r\n/);
        if (clMatch) {
            const length = parseInt(clMatch[1], 10);
            const headerStr = clMatch[0];
            const headerOffset = str.indexOf(headerStr);
            const bodyOffset = headerOffset + headerStr.length;
            
            if (nextBuffer.length >= bodyOffset + length) {
                const body = nextBuffer.slice(bodyOffset, bodyOffset + length).toString('utf8');
                nextBuffer = nextBuffer.slice(bodyOffset + length);
                try { onMessage(JSON.parse(body)); } catch (_e) { /* corrupted */ }
                continue;
            }
        } else {
            // Fallback: NDJSON (line-based)
            const newlineIndex = str.indexOf('\n');
            if (newlineIndex !== -1) {
                const line = str.substring(0, newlineIndex).trim();
                nextBuffer = nextBuffer.slice(newlineIndex + 1);
                if (line && line.startsWith('{')) {
                    try { onMessage(JSON.parse(line)); } catch (_e) { /* skip */ }
                }
                continue;
            }
        }
        break;
    }
    return nextBuffer;
}

module.exports = { createContentLengthFrame, parseInputBuffer };
