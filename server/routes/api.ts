import { Router } from 'express';
import config from '../config/env.js';
import { GeminiRestService } from '../services/copilot/organisms/gemini-rest-service.js';
import { handleCopilotRequest } from './handlers/copilot-handler.js';

const apiRouter = Router();

// Endpoint 1: Config (Atomized in API Router)
apiRouter.get('/config', (req, res) => {
  res.json({
    COPILOT_MODEL: config.COPILOT_MODEL,
    AVAILABLE_MODELS_GEMINI: config.AVAILABLE_MODELS_GEMINI,
  });
});

// Endpoint 2: Validate Gemini Key (Direct delegation)
apiRouter.post('/gemini/validate', async (req, res) => {
  try {
    const { apiKey } = req.body;
    await GeminiRestService.validate(apiKey);
    res.json({ status: 200, detail: 'Gemini Key is valid' });
  } catch (err: any) {
    res.status(err.status || 401).json({ status: err.status, detail: err.detail });
  }
});

// Endpoint 3: Core Copilot (Handled by Atomized Handler)
apiRouter.post('/copilot', handleCopilotRequest);

export default apiRouter;
