import { Router } from 'express';
import config from '../../config/env.js';
import { GeminiRestService } from '../../services/copilot/organisms/gemini-rest-service.js';
import { handleCopilotRequest } from './copilot-handler.js';

const apiRouter = Router();

// Endpoint 1: Config (Atomized in API Router)
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

// Endpoint 2: Validate Gemini Key (Direct delegation)
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
    const { resolveACPOptions } = await import('../../services/copilot/molecules/option-resolver.js');
    const { getOrCreateClient } = await import('../../services/copilot/molecules/client-manager.js');
    
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
    
    // Explicit health check with timeout to avoid permanent hangs (matches SDK session creation timeout)
    const pingTask = client.ping('health-check');
    const pingTimeout = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("ACP Handshake Timeout: Agent did not respond to ping.")), 15000);
    });
    
    await Promise.race([pingTask, pingTimeout]);
    
    res.json({ status: 200, detail: `${method} session is valid via ACP` });
  } catch (err: unknown) {
    console.error(`[ACP Token Validation Error]`, err);
    res.status(401).json({ status: 401, detail: `Invalid credentials or ACP failure` });
  }
});

// Endpoint 2.5: Start Gemini CLI (for frontend trigger)
apiRouter.post('/gemini/start-cli', async (req, res) => {
  try {
    // This endpoint is called by the frontend to trigger Gemini CLI startup
    // The actual CLI is started on-demand by the SDK, so we just acknowledge
    console.log('[API] Gemini CLI startup requested by frontend');
    res.json({ status: 200, detail: 'Gemini CLI startup acknowledged' });
  } catch (_err: unknown) {
    res.status(500).json({ status: 500, detail: 'Failed to acknowledge CLI startup' });
  }
});

// Endpoint 3: Health Check for SDK and ACP connections
apiRouter.get('/health', async (req, res) => {
  try {
    const { ModernSDKOrchestrator } = await import('../../services/copilot/organisms/sdk-orchestrator-v2.js');
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

// Endpoint 5: Respond to AI Question (Resolves pendings in SDK Orchestrator)
apiRouter.post('/copilot/response', async (req, res) => {
  try {
    const { sessionId, answer } = req.body;
    if (!sessionId || typeof sessionId !== 'string') {
      return res.status(400).json({ status: 400, detail: 'Missing or invalid sessionId' });
    }
    const { ModernSDKOrchestrator } = await import('../../services/copilot/organisms/sdk-orchestrator-v2.js');
    
    const resolved = ModernSDKOrchestrator.resolveInput(sessionId, answer);
    if (!resolved) {
      return res.status(404).json({ status: 404, detail: 'Session not found or already resolved' });
    }
    res.json({ status: 200, detail: 'Response received' });
  } catch (err: unknown) {
    res.status(500).json({ status: 500, detail: String(err) });
  }
});

// Endpoint 4: Core Copilot (Handled by Atomized Handler)
apiRouter.post('/copilot', handleCopilotRequest);

export default apiRouter;
