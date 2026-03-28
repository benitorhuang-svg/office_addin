#!/usr/bin/env node
// Minimal local agent to run whitelisted dev tasks on localhost only.
// Security: binds to 127.0.0.1, requires a token (env LOCAL_AGENT_TOKEN or token file).

import express from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { spawn } from 'child_process';

const APP_PORT = Number(process.env.LOCAL_AGENT_PORT || 17817);
const TOKEN_FILE = path.join(process.cwd(), 'server', 'local-agent', '.agent_token');
const tokenFromEnv = process.env.LOCAL_AGENT_TOKEN;

function getOrCreateToken() {
  if (tokenFromEnv) return tokenFromEnv;
  try {
    if (fs.existsSync(TOKEN_FILE)) {
      return fs.readFileSync(TOKEN_FILE, 'utf8').trim();
    }
  } catch (_e) { /* ignored */ }
  const t = crypto.randomBytes(24).toString('hex');
  try { fs.writeFileSync(TOKEN_FILE, t, { encoding: 'utf8', mode: 0o600 }); } catch (_e) { /* ignored */ }
  return t;
}

const AGENT_TOKEN = getOrCreateToken();

const app = express();
app.use(express.json());

// Add CORS support for Cloud PWA control
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-local-agent-token');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// Simple auth and localhost check middleware
app.use((req, res, next) => {
  const ip = (req.ip || req.connection.remoteAddress || '').replace('::ffff:', '');
  if (!(ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1')) {
    return res.status(403).json({ error: 'forbidden', reason: 'agent accepts localhost only' });
  }
  
  const provided = req.headers['x-local-agent-token'] || req.query.token;
  if (!provided || String(provided) !== AGENT_TOKEN) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  next();
});

let activeProcess = null;
let processLogs = [];

function addLog(data) {
  const line = data.toString();
  processLogs.push(line);
  if (processLogs.length > 200) processLogs.shift();
  // Optional: write to console for easier debugging
  process.stdout.write(`[child] ${line}`);
}

// SSE Route for real-time logs
app.get('/logs', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Send current buffer
  res.write(`data: ${JSON.stringify({ type: 'init', logs: processLogs })}\n\n`);

  // To be simple, we don't push new logs here yet, we'll let frontend poll 
  // or we could use a global emitter. But for now, periodic ping.
  const interval = setInterval(() => {
    res.write(`data: ${JSON.stringify({ type: 'heartbeat', ok: !!activeProcess })}\n\n`);
  }, 10000);

  req.on('close', () => clearInterval(interval));
});

app.post('/command', (req, res) => {
  const { action } = req.body;
  if (action === 'boot') {
    if (activeProcess) return res.json({ status: 'running' });
    
    processLogs = ["[system] Initializing boot sequence..."];
    const cmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
    const projectRoot = process.cwd(); 

    console.log('[local-agent] Booting system from:', projectRoot);
    
    activeProcess = spawn(cmd, ['run', 'dev'], { 
      cwd: projectRoot,
      shell: true 
    });

    activeProcess.stdout.on('data', addLog);
    activeProcess.stderr.on('data', addLog);
    activeProcess.on('close', (code) => {
      addLog(`[system] Process exited with code ${code}`);
      activeProcess = null;
    });

    return res.json({ status: 'booting' });
  }

  if (action === 'stop') {
    if (activeProcess) {
      activeProcess.kill();
      activeProcess = null;
      return res.json({ status: 'stopped' });
    }
  }

  return res.status(400).json({ error: 'unknown_action' });
});

app.listen(APP_PORT, '127.0.0.1', () => {
  console.log(`[local-agent] Listening on 127.0.0.1:${APP_PORT}`);
  if (process.argv.includes('--open')) {
    const CLOUD_URL = process.env.CLOUD_PWA_URL || 'http://localhost:3001';
    const launchUrl = `${CLOUD_URL}?agent_token=${AGENT_TOKEN}`;
    const startCmd = process.platform === 'win32' ? 'start' : (process.platform === 'darwin' ? 'open' : 'xdg-open');
    spawn(startCmd, [launchUrl], { shell: true }).unref();
  }
});

export { AGENT_TOKEN };
