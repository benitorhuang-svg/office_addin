import { Router } from 'express';
import config from '../../config/env.js';
import { GeminiRestService } from '../../services/copilot/organisms/gemini-rest-service.js';
import { handleCopilotRequest } from './copilot-handler.js';

const apiRouter = Router();

// Endpoint 1: Config (Atomized in API Router)
apiRouter.get('/config', (req, res) => {
  res.json({
    COPILOT_MODEL: config.COPILOT_MODEL,
    AVAILABLE_MODELS_GEMINI: config.AVAILABLE_MODELS_GEMINI,
    APP_TITLE: config.APP_TITLE,
    FALLBACK_PRESETS: config.FALLBACK_PRESETS,
    PREVIEW_MODE_GUIDE_MD: config.PREVIEW_MODE_GUIDE_MD,
    DEFAULT_WORD_FONT_STYLE: config.DEFAULT_WORD_FONT_STYLE,
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
    const { ModernSDKOrchestrator } = await import('../../services/copilot/organisms/sdk-orchestrator-v2.js');
    
    ModernSDKOrchestrator.resolveInput(sessionId, answer);
    res.json({ status: 200, detail: 'Response received' });
  } catch (err: unknown) {
    res.status(500).json({ status: 500, detail: String(err) });
  }
});

// Endpoint 4: Core Copilot (Handled by Atomized Handler)
apiRouter.post('/copilot', handleCopilotRequest);

export default apiRouter;
