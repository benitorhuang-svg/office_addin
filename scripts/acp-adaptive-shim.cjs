const path = require('node:path');
const child_process = require('node:child_process');

/**
 * ACP Adaptive Shim (Version Faker Version)
 */

const args = process.argv.slice(2);
const targetPackagePath = args.shift(); 
if (!targetPackagePath) process.exit(1);

const UNSUPPORTED = ['debug', 'stdio', '--headless', '--auto-update', '--autoUpdate', '--no-auto-update', '--log-level', '--logLevel', '--stdio', '--no-auto-login', '--auth-token-env'];
const filteredArgs = args.filter(a => !UNSUPPORTED.includes(a));
if (!filteredArgs.includes('--acp')) filteredArgs.push('--acp');

const targetEntry = path.resolve(targetPackagePath).replace(/\\/g, '/');
process.stderr.write(`[Shim] Bridging Handshake... Target: ${targetEntry}\n`);

const child = child_process.spawn(process.execPath, ['--no-warnings', targetEntry, ...filteredArgs], {
  stdio: ['pipe', 'pipe', 'pipe'],
  env: { ...process.env, DEBUG: '' },
  windowsHide: true,
  shell: false
});

child.stdout.on('data', (chunk) => {
  const lines = chunk.toString('utf8').split(/\r?\n/);
  for (const line of lines) {
    if (!line.trim()) continue;
    try {
      const msg = JSON.parse(line);
      // FAKE PROTOCOL VERSION for initialization result
      if (msg.result && msg.result.protocolVersion === 1) {
        msg.result.protocolVersion = 2; // Force compatibility
      }
      const body = JSON.stringify(msg);
      process.stdout.write(`Content-Length: ${Buffer.byteLength(body, 'utf8')}\r\n\r\n${body}`);
    } catch(e) {
       // Fallback for non-JSON or parsing errors
       process.stdout.write(`Content-Length: ${Buffer.byteLength(line, 'utf8')}\r\n\r\n${line}`);
    }
  }
});

child.stderr.pipe(process.stderr);

let buffer = Buffer.alloc(0);
let contentLength = -1;

process.stdin.on('data', (chunk) => {
  buffer = Buffer.concat([buffer, chunk]);
  while (buffer.length > 0) {
    if (contentLength === -1) {
      const str = buffer.toString('utf8');
      const headerEndMatch = str.match(/\r?\n\r?\n/);
      if (headerEndMatch) {
        const headerText = str.substring(0, headerEndMatch.index);
        const clMatch = headerText.match(/Content-Length:\s*(\d+)/i);
        contentLength = clMatch ? parseInt(clMatch[1], 10) : -1;
        buffer = buffer.subarray(headerEndMatch.index + headerEndMatch[0].length);
      } else break;
    }
    if (contentLength !== -1 && buffer.length >= contentLength) {
      const payloadBuf = buffer.subarray(0, contentLength);
      buffer = buffer.subarray(contentLength);
      contentLength = -1;

      const msg = JSON.parse(payloadBuf.toString('utf8'));
      
      // Map Methods
      if (msg.method === 'ping') {
        msg.method = 'initialize';
        msg.params = { 
          protocolVersion: 1, // Gemini CLI likely only understands 1
          clientCapabilities: { fs: { canRead: true, canWrite: true } },
          clientInfo: { name: "word-agent-shim", version: "1.0.0" }
        };
      } else if (msg.method === 'session.create') {
        msg.method = 'newSession';
        msg.params = { cwd: process.cwd(), mcpServers: [] };
      } else if (msg.method === 'session.send') {
        msg.method = 'prompt';
      }

      child.stdin.write(JSON.stringify(msg) + '\n');
    } else break;
  }
});

child.on('exit', (code) => process.exit(code || 0));
