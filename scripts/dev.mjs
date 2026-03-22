import { execFileSync, spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const devCerts = require('office-addin-dev-certs');

const repoRoot = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const ports = [3000, 4000, 4001];

function getListeningPids(port) {
  try {
    const command = `Get-NetTCPConnection -State Listen | Where-Object { $_.LocalPort -eq ${port} } | Select-Object -ExpandProperty OwningProcess`;
    const output = execFileSync('powershell', ['-NoProfile', '-Command', command], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    return output
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => Number(line))
      .filter(Boolean);
  } catch {
    return [];
  }
}

function getCommandLine(pid) {
  try {
    const command = `$p = Get-CimInstance Win32_Process -Filter "ProcessId=${pid}"; if ($p) { $p.CommandLine }`;
    return execFileSync('powershell', ['-NoProfile', '-Command', command], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    }).trim();
  } catch {
    return '';
  }
}

function killPid(pid) {
  try {
    execFileSync('taskkill', ['/PID', String(pid), '/T', '/F'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    console.log(`Stopped stale process on port for PID ${pid}`);
  } catch (error) {
    console.warn(`Failed to stop PID ${pid}: ${error.message || error}`);
  }
}

function killStaleRepoListeners() {
  const repoMarker = path.resolve(repoRoot).toLowerCase();

  for (const port of ports) {
    for (const pid of getListeningPids(port)) {
      const commandLine = getCommandLine(pid).toLowerCase();
      if (
        commandLine.includes(repoMarker) ||
        commandLine.includes('webpack-dev-server') ||
        commandLine.includes('server/index.js') ||
        commandLine.includes('npm-cli.js run dev')
      ) {
        killPid(pid);
      }
    }
  }
}

function startProcess(command, args, label, children) {
  const child = spawn(command, args, {
    cwd: path.resolve(repoRoot),
    stdio: 'inherit',
    env: process.env,
  });

  child.on('exit', (code) => {
    if (!process.exitCode) {
      process.exitCode = code ?? 1;
    }
    for (const other of children) {
      if (other !== child && !other.killed) {
        other.kill();
      }
    }
  });

  child.on('error', (error) => {
    console.error(`${label} failed to start:`, error);
    process.exitCode = 1;
  });

  return child;
}

async function runDev() {
  killStaleRepoListeners();

  console.log('[Dev] Ensuring dev certificates are installed...');
  try {
    await devCerts.getHttpsServerOptions();
  } catch (err) {
    console.error('[Dev] Failed to ensure dev certificates:', err.message);
    console.warn('[Dev] Continuing, but subprocesses may fail to install certificates concurrently.');
  }

  const npmCliPath = process.env.npm_execpath;
  if (!npmCliPath) {
    throw new Error('npm_execpath is required to launch dev subprocesses');
  }

  const children = [];
  children.push(startProcess(process.execPath, [npmCliPath, 'run', 'dev-server'], 'dev-server', children));
  children.push(startProcess(process.execPath, [npmCliPath, 'run', 'start:server'], 'start:server', children));
  children.push(startProcess(process.execPath, [npmCliPath, 'run', 'start:addin'], 'addin', children));
  
  // Gemini CLI now dynamically spawned by SDK because it doesn't support long-running port servers

  const shutdown = () => {
    for (const child of children) {
      if (!child.killed) {
        child.kill();
      }
    }
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

runDev().catch((err) => {
  console.error('[Critical] Dev script failed:', err);
  process.exit(1);
});