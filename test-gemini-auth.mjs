import { spawn } from 'child_process';
import path from 'path';

const repoRoot = process.cwd();
const geminiScript = path.join(repoRoot, 'node_modules', '@google', 'gemini-cli', 'dist', 'index.js');

console.log('--- Debug: Gemini CLI Connection Test ---');
console.log('Script Path:', geminiScript);

// 模擬我們目前的隔離邏輯
const { GEMINI_API_KEY: _key, ...cleanEnv } = process.env;

const child = spawn(process.execPath, [geminiScript, '--acp', '-y'], {
    stdio: ['pipe', 'pipe', 'pipe'],
    cwd: repoRoot,
    env: { 
        ...cleanEnv, 
        NODE_ENV: 'production'
    }
});

child.stderr.on('data', (d) => {
    console.log('STDERR:', d.toString());
});

child.stdout.on('data', (d) => {
    console.log('STDOUT:', d.toString());
    // 如果連線成功，應該會輸出 JSON-RPC 的 initialize 響應
});

setTimeout(() => {
    console.log('Test timeout, killing child...');
    child.kill();
    process.exit();
}, 5000);
