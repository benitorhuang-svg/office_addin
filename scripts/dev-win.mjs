import { spawn, execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { createRequire } from 'node:module';
import readline from 'node:readline';

const require = createRequire(import.meta.url);

const repoRoot = path.resolve(fileURLToPath(new URL('..', import.meta.url)));

console.log('[Dev Win] Starting development servers with Windows-optimized signal handling...');

const processes = [];
let isShuttingDown = false;

function killProcessTree(pid) {
  try {
    execSync(`taskkill /pid ${pid} /T /F`, { stdio: 'ignore' });
    console.log(`[Dev Win] Killed process tree for PID ${pid}`);
  } catch (error) {
    console.warn(`[Dev Win] Failed to kill PID ${pid}:`, error.message);
  }
}

function startProcess(command, args, label) {
  console.log(`[Dev Win] Starting ${label}...`);
  
  const child = spawn(command, args, {
    cwd: repoRoot,
    stdio: 'inherit',
    shell: true,
    detached: false
  });

  child.on('error', (error) => {
    console.error(`[Dev Win] ${label} failed:`, error.message);
  });

  child.on('exit', (code) => {
    console.log(`[Dev Win] ${label} exited with code ${code}`);
  });

  processes.push({ child, label, pid: child.pid });
  return child;
}

function shutdown() {
  if (isShuttingDown) return;
  isShuttingDown = true;
  
  console.log('\n[Dev Win] Shutting down all processes...');
  
  // Kill all child processes using Windows taskkill
  processes.forEach(({ child, label, pid }) => {
    if (pid) {
      console.log(`[Dev Win] Stopping ${label} (PID: ${pid})...`);
      killProcessTree(pid);
    }
  });
  
  // Also kill any remaining processes on our ports
  const ports = [3000, 4000, 4001];
  ports.forEach(port => {
    try {
      const result = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8', stdio: 'pipe' });
      const lines = result.split('\n').filter(line => line.includes('LISTENING'));
      lines.forEach(line => {
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        if (pid && !isNaN(pid)) {
          killProcessTree(pid);
        }
      });
    } catch (error) {
      // Ignore errors - port might not be in use
    }
  });
  
  console.log('[Dev Win] Cleanup completed');
  process.exit(0);
}

// ─── Pre-emptive Cleanup ───────────────────────────────────────
function cleanupPorts(ports) {
  console.log(`[Dev Win] Pre-emptive cleanup of ports: ${ports.join(', ')}...`);
  ports.forEach(port => {
    try {
      const result = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8', stdio: 'pipe' });
      const lines = result.split('\n').filter(line => line.includes('LISTENING'));
      lines.forEach(line => {
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        if (pid && !isNaN(pid) && parseInt(pid) !== process.pid) {
          killProcessTree(pid);
        }
      });
    } catch (e) {}
  });
}

cleanupPorts([3000, 4000, 4001]);

// ─── Start all processes ───────────────────────────────────────
startProcess('npm', ['run', 'dev-server'], 'webpack-dev-server');
startProcess('npm', ['run', 'start:server'], 'api-server');
startProcess('npm', ['run', 'start:addin'], 'office-addin');

// ─── Modern Signal Handling ─────────────────────────────────────
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

if (process.platform === 'win32') {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.on('SIGINT', shutdown);
}

console.log('[Dev Win] All processes started. Press Ctrl+C to stop.');
console.log('[Dev Win] Frontend: https://localhost:3000');
console.log('[Dev Win] API: https://localhost:4000');