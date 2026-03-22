const { spawn } = require('child_process');
const path = require('path');

const node = process.execPath;
console.log('Node path:', node);

const cp = spawn(node, ['-v'], { shell: false });
cp.stdout.on('data', (d) => console.log('stdout:', d.toString()));
cp.stderr.on('data', (d) => console.error('stderr:', d.toString()));
cp.on('close', (c) => console.log('exit code:', c));

const cpShell = spawn(node, ['-v'], { shell: true });
cpShell.stdout.on('data', (d) => console.log('shell stdout:', d.toString()));
cpShell.stderr.on('data', (d) => console.error('shell stderr:', d.toString()));
cpShell.on('close', (c) => console.log('shell exit code:', c));
