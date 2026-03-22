const { spawn } = require('child_process');
const repoRoot = 'c:\\Users\\user\\Documents\\PowerQuery\\Github_Copilot_SDK_addin';
const geminiScript = repoRoot + '\\node_modules\\@google\\gemini-cli\\dist\\index.js';

console.log('Testing gemini-cli with session.create...');

const child = spawn(process.execPath, [geminiScript, '--acp'], {
  stdio: ['pipe', 'pipe', 'inherit'],
  cwd: repoRoot,
  env: process.env
});

child.stdout.on('data', (data) => {
  console.log('CLI STDOUT:', data.toString());
});

const payload = {"jsonrpc":"2.0","id":1,"method":"session.create","params":{"model":"gemini-2.0-flash-exp","requestPermission":true,"requestUserInput":false,"hooks":false,"streaming":false,"envValueMode":"direct"}};
const body = JSON.stringify(payload);
const message = `Content-Length: ${Buffer.byteLength(body)}\r\n\r\n${body}`;

child.stdin.write(message);
console.log('Sent session.create. Waiting for response...');

setTimeout(() => {
  console.log('Timeout. Closing.');
  child.kill();
  process.exit(0);
}, 10000);
