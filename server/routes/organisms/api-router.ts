import { Router } from 'express';
import config from '../../config/env.js';
import { GeminiRestService } from '../../services/copilot/organisms/gemini-rest-service.js';
import { handleCopilotRequest } from './copilot-handler.js';
import { resolveACPOptions } from '../../services/copilot/molecules/option-resolver.js';
import { getOrCreateClient } from '../../services/copilot/molecules/client-manager.js';
import { ModernSDKOrchestrator } from '../../services/copilot/organisms/sdk-orchestrator-v2.js';

const apiRouter = Router();

// Endpoint: Get Server Configuration
apiRouter.get('/config', (req, res) => {
  console.log(`[API] Serving config, AUTO_CONNECT_CLI: ${config.AUTO_CONNECT_CLI}`);
  res.json({
    COPILOT_MODEL: config.COPILOT_MODEL,
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
    await GeminiRestService.validate(apiKey);
    res.json({ status: 200, detail: 'Gemini Key is valid' });
  } catch (err: unknown) {
    const error = err as { status?: number; detail?: string };
    res.status(error.status || 401).json({ status: error.status, detail: error.detail });
  }
});

// Unified Endpoint: Validate ANY login method via Native ACP Spec (GitHub Copilot SDK)
apiRouter.post('/acp/validate', async (req, res) => {
  try {
    const { method, token, endpoint, deployment } = req.body;
    if (!method) return res.status(400).json({ detail: 'Method missing' });
    
    // We map 'method' string from frontend to the proper ACPConnectionMethod inside the backend
    const acpMethod = method === "azure" ? "azure_byok" : (method === "gemini" ? "gemini_cli" : "copilot_cli");
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
    const client = await getOrCreateClient(acpMethod, clientOptions);
    
    // Explicit health check with timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    
    try {
      await client.ping('health-check');
      res.json({ status: 200, detail: `${method} session is valid via ACP` });
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'name' in err && err.name === 'AbortError') {
        throw new Error("ACP Handshake Timeout: Agent did not respond to ping within 15s");
      }
      throw err;
    } finally {
      clearTimeout(timeout);
    }
  } catch (err: unknown) {
    console.error(`[ACP Token Validation Error]`, err);
    res.status(401).json({ status: 401, detail: err instanceof Error ? err.message : `Invalid credentials or ACP failure` });
  }
});


// Endpoint: Health Checks & Connection Status
apiRouter.get('/health', async (req, res) => {
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
apiRouter.post('/copilot/response', async (req, res) => {
  try {
    const { sessionId, answer } = req.body;
    if (!sessionId || typeof sessionId !== 'string') {
      return res.status(400).json({ status: 400, detail: 'Missing or invalid sessionId' });
    }
    
    const resolved = ModernSDKOrchestrator.resolveInput(sessionId, answer);
    if (!resolved) {
      return res.status(404).json({ status: 404, detail: 'Session not found or already resolved' });
    }
    res.json({ status: 200, detail: 'Response received' });
  } catch (err: unknown) {
    res.status(500).json({ status: 500, detail: String(err) });
  }
});

// Endpoint: Main Copilot Generation (Streaming supported)
apiRouter.post('/copilot', handleCopilotRequest);

export default apiRouter;
