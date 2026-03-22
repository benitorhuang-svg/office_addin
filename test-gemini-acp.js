const { spawn } = require('child_process');
const path = require('path');

const wrapperScript = path.join(__dirname, 'scripts', 'gemini-wrapper.js');

const child = spawn(process.execPath, [wrapperScript], {
  stdio: ['pipe', 'pipe', 'pipe'],
  env: { ...process.env, GEMINI_API_KEY: 'dummy_key' }
});

child.stdout.on('data', d => console.log('STDOUT:', d.toString()));
child.stderr.on('data', d => console.log('STDERR:', d.toString()));
child.on('exit', code => console.log('EXIT:', code));

// Wait, then send session.create
setTimeout(() => {
  const req = {"jsonrpc":"2.0","id":1,"method":"session.create","params":{"model":"gemini-1.5-flash","requestPermission":true,"requestUserInput":false,"hooks":false,"streaming":false,"envValueMode":"direct"}};
  const reqStr = JSON.stringify(req);
  const msg = `Content-Length: ${Buffer.byteLength(reqStr)}\r\n\r\n${reqStr}`;
  console.log('Sending session.create');
  child.stdin.write(msg);
}, 2000);

// Keep alive
setTimeout(() => { console.log('Timeout'); }, 10000);
