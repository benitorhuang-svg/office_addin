import { Router } from 'express';
import config from '@config/env.js';
import { GeminiRestService } from '@adapters/ai-providers/gemini-adapter.js';
import { handleCopilotRequest } from '@api/organisms/copilot-handler.js';
import { resolveACPOptions } from '@shared/molecules/ai-core/option-resolver.js';
import { getOrCreateClient } from '@shared/molecules/ai-core/client-manager.js';
import { ModernSDKOrchestrator } from '@orchestrator/workflow-graph.js';
import { NexusSocketRelay } from '@infra/services/molecules/nexus-socket.js';
import { GlobalSystemState } from '@infra/services/molecules/system-state-store.js';
import type { ACPConnectionMethod } from '@shared/atoms/ai-core/types.js';
import { createRateLimiter } from '@api/molecules/rate-limiter.js';
import { validateCopilotRequest } from '@api/atoms/request-validator.js';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const limiter = createRateLimiter();
const ACP_VALIDATION_METHODS: Record<string, ACPConnectionMethod> = {
  azure: 'azure_byok',
  azure_openai: 'azure_byok',
  azure_byok: 'azure_byok',
  gemini: 'gemini_cli',
  gemini_cli: 'gemini_cli',
  copilot: 'copilot_cli',
  copilot_cli: 'copilot_cli',
};



const apiRouter = Router();

// Endpoint: Get Server Configuration
apiRouter.get('/config', (_req, res) => {
  console.log(`[API] Serving config, AUTO_CONNECT_CLI: ${config.AUTO_CONNECT_CLI}`);
  res.json({
    COPILOT_MODEL: config.COPILOT_MODEL,
    AVAILABLE_MODELS_GITHUB: config.AVAILABLE_MODELS_GITHUB,
    AVAILABLE_MODELS_GEMINI: config.AVAILABLE_MODELS_GEMINI,
    APP_TITLE: config.APP_TITLE,
    FALLBACK_PRESETS: config.FALLBACK_PRESETS,
    PREVIEW_MODE_GUIDE_MD: config.PREVIEW_MODE_GUIDE_MD,
    DEFAULT_WORD_FONT_STYLE: config.DEFAULT_WORD_FONT_STYLE,
    AUTO_CONNECT_CLI: config.AUTO_CONNECT_CLI,
  });
});

// Endpoint: Validate Gemini Direct API Key
apiRouter.post('/gemini/validate', async (req, res) => {
  try {
    const { apiKey } = req.body;
    if (typeof apiKey !== 'string' || !apiKey.trim()) {
      res.status(400).json({ status: 400, detail: 'apiKey missing' });
      return;
    }
    await GeminiRestService.validate(apiKey);
    res.json({ status: 200, detail: 'Gemini Key is valid' });
  } catch (err: unknown) {
    const error = err as { status?: number; detail?: string };
    const status = error.status || 401;
    res.status(status).json({ status, detail: error.detail || 'Gemini Key is invalid' });
  }
});

// Unified Endpoint: Validate ANY login method via Native ACP Spec (GitHub Copilot SDK)
apiRouter.post('/acp/validate', async (req, res) => {
  let client: Awaited<ReturnType<typeof getOrCreateClient>> | undefined;
  let validationTimer: ReturnType<typeof setTimeout> | undefined;

  try {
    const { method, token, endpoint, deployment } = req.body;
    if (typeof method !== 'string' || !method.trim()) {
      res.status(400).json({ detail: 'Method missing' });
      return;
    }

    const acpMethod = ACP_VALIDATION_METHODS[method];
    if (!acpMethod) {
      res.status(400).json({ detail: `Unsupported ACP validation method: ${method}` });
      return;
    }

    console.log(`[API] Validating ${method} via ${acpMethod}...`);
    
    // Natively build Copilot Client Options with the injected tokens for the specific ACP agent
    const { clientOptions } = resolveACPOptions({
      method: acpMethod,
      model: acpMethod === 'gemini_cli' ? 'gemini-1.5-flash' : 'github-models',
      streaming: false,
      githubToken: acpMethod === 'copilot_cli' ? (token || undefined) : undefined,
      geminiKey: acpMethod === 'gemini_cli' ? token : undefined,
      azure: acpMethod === 'azure_byok' ? { apiKey: token, endpoint, deployment } : undefined
    });
    
    // Spawn and start the client to explicitly validate credentials via ACP JSON-RPC handshake
    client = await getOrCreateClient(acpMethod, clientOptions);
    
    // Explicit health check with timeout
    const validationTimeoutMs = 15_000;
    const pingPromise = client.ping('health-check');
    const timeoutPromise = new Promise<never>((_, reject) => {
      validationTimer = setTimeout(() => {
        reject(new Error('ACP Handshake Timeout: Agent did not respond to ping within 15s'));
      }, validationTimeoutMs);
    });

    await Promise.race([pingPromise, timeoutPromise]);
    res.json({ status: 200, detail: `${method} session is valid via ACP` });
  } catch (err: unknown) {
    console.error(`[ACP Token Validation Error]`, err);
    const detail = err instanceof Error ? err.message : `Invalid credentials or ACP failure`;
    const status = detail.includes('Timeout') ? 504 : 401;
    res.status(status).json({ status, detail });
  } finally {
    if (validationTimer) {
      clearTimeout(validationTimer);
    }
  }
});


// Endpoint: Health Checks & Connection Status
apiRouter.get('/health', async (_req, res) => {
  try {
    const health = await ModernSDKOrchestrator.healthCheck();
    
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      clients: health,
      uptime: process.uptime()
    });
  } catch (err: unknown) {
    res.status(500).json({ 
      status: 'error', 
      detail: err instanceof Error ? err.message : String(err),
      timestamp: new Date().toISOString()
    });
  }
});

// Endpoint: Handle Human-in-the-loop (Ask User) Response
apiRouter.post('/copilot/response', async (req, res): Promise<void> => {
  try {
    const { sessionId, answer } = req.body;
    if (!sessionId || typeof sessionId !== 'string') {
      res.status(400).json({ status: 400, detail: 'Missing or invalid sessionId' });
      return;
    }
    
    const resolved = ModernSDKOrchestrator.resolveInput(sessionId, answer);
    if (!resolved) {
      res.status(404).json({ status: 404, detail: 'Session not found or already resolved' });
      return;
    }
    res.json({ status: 200, detail: 'Response received' });
  } catch (err: unknown) {
    res.status(500).json({ status: 500, detail: String(err) });
  }
});

// Endpoint: Main Copilot Generation (Streaming supported)
apiRouter.post('/copilot', limiter, validateCopilotRequest, handleCopilotRequest);


// --- SYSTEM CONTROLS (PWA Managed) ---

// Endpoint: Trigger SDK Patching
apiRouter.post('/system/patch', async (_req, res) => {
  try {
    console.log('[API] Triggering SDK Patching...');
    const patcherPath = path.resolve(process.cwd(), 'scripts', 'patch-copilot-sdk.mjs');
    const patcherUrl = `${pathToFileURL(patcherPath).href}?t=${Date.now()}-${Math.random().toString(36).slice(2)}`;
    await import(patcherUrl); 
    res.json({ status: 200, detail: 'SDK Patched successfully' });
  } catch (err: unknown) {
    res.status(500).json({ status: 500, detail: String(err) });
  }
});

// Endpoint: Stop All AI Gateways
apiRouter.post('/gateway/stop', async (_req, res) => {
  try {
    const { stopAllClients } = (await import('@shared/molecules/ai-core/client-manager.js')) as { stopAllClients: () => Promise<void> };
    await stopAllClients();
    res.json({ status: 200, detail: 'All AI gateways disconnected' });
  } catch (err: unknown) {
    res.status(500).json({ status: 500, detail: String(err) });
  }
});

// --- SESSION SYNC (Cross-Environment Bridge) ---
apiRouter.get('/system/state', (_req, res) => {
  res.json(GlobalSystemState.getState());
});

apiRouter.post('/system/state', (req, res) => {
  const { power, provider, isWarming, isStreaming } = req.body;
  const origin = req.headers.origin || 'unknown';
  
  GlobalSystemState.update({ power, provider, isWarming, isStreaming });
  const newState = GlobalSystemState.getState();
  
  console.log(`[Sync] Update from ${origin} -> Power: ${newState.power}, Provider: ${newState.provider}, Streaming: ${newState.isStreaming}`);
  
  NexusSocketRelay.broadcast('SYSTEM_STATE_UPDATED', newState);
  res.json({ status: 200, ...newState });
});

apiRouter.get('/system/warmup', async (_req, res) => {
    GlobalSystemState.update({ isWarming: true });
    console.log('[API] Warming up AI Gateways...');
    try {
        const { warmUpClient } = (await import('@shared/molecules/ai-core/client-manager.js')) as { warmUpClient: (method: ACPConnectionMethod) => Promise<void> };
        await warmUpClient(GlobalSystemState.getState().provider);
        GlobalSystemState.update({ isWarming: false });
        res.json({ status: 200, detail: 'Warming complete' });
    } catch (e) {
        GlobalSystemState.update({ isWarming: false });
        res.status(500).json({ status: 500, detail: String(e) });
    }
});

// Helper to restrict system controls to local environment
const isLocalRequest = (req: import('express').Request) => {
  const ip = req.ip || req.socket.remoteAddress || '';
  return ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1' || process.env.NODE_ENV !== 'production';
};

// Endpoint: Force System Shutdown (TaskPane Quit)
apiRouter.post('/system/quit', (req, res) => {
  if (!isLocalRequest(req)) {
      res.status(403).json({ detail: 'System controls are restricted.' });
      return;
  }
  console.log('[API] System Shutdown Triggered.');
  res.json({ status: 200, detail: 'Shutting down...' });
  setTimeout(() => process.exit(0), 1000); 
});

export default apiRouter;
