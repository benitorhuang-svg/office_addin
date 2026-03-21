import express, { Request, Response, Router } from 'express';
import config from '../config/env.js';
import * as promptBuilder from '../services/promptBuilder.js';
import * as copilotService from '../services/copilotService.js';

const apiRouter: Router = express.Router();

apiRouter.get('/config', (_req: Request, res: Response) => {
  const serverTokenConfigured = Boolean(config.getServerPatToken());
  const hasOAuthConfig = Boolean(config.GITHUB_CLIENT_ID);
  const authMode = serverTokenConfigured ? 'pat' : hasOAuthConfig ? 'oauth' : 'cli';

  res.json({
    ok: true,
    authMode,
    serverTokenConfigured,
    model: config.COPILOT_MODEL,
    availableModels: config.AVAILABLE_MODELS,
    writingPresets: promptBuilder.getWritingPresets(),
    defaultResponseLanguage: config.DEFAULT_RESPONSE_LANGUAGE,
    defaultPersona: config.DEFAULT_PERSONA,
    apiUrl: config.COPILOT_API_URL,
    cliPathConfigured: false,
  });
});

apiRouter.post('/validate-gemini', async (req: Request, res: Response) => {
  const geminiKeyHeader = (req.headers['x-gemini-key'] as string) || '';
  if (!geminiKeyHeader) return res.status(400).json({ ok: false, message: 'Missing API key' });

  try {
    // Simple verification by asking for models or a tiny prompt
    await copilotService.sendPromptToGeminiAPI(geminiKeyHeader, 'gemini-1.5-flash', {
      system: 'You are a validator.',
      user: 'say ok'
    });
    res.json({ ok: true, message: 'API key is valid' });
  } catch (err: any) {
    res.status(401).json({ ok: false, message: err.detail || 'Invalid API key' });
  }
});

apiRouter.post('/copilot', async (req: Request, res: Response) => {
  const { prompt, officeContext, model, presetId, writingPresetId } = req.body || {};
  if (!prompt) return res.status(400).json({ error: 'missing prompt' });

  const authHeader = req.headers.authorization || '';
  const geminiKeyHeader = (req.headers['x-gemini-key'] as string) || '';
  const resolvedModel = config.AVAILABLE_MODELS.includes(model) ? model : config.COPILOT_MODEL;

  const wordPrompt = promptBuilder.buildWordPrompt(prompt, officeContext, resolvedModel, presetId || writingPresetId);

  console.log(`[${new Date().toISOString()}] POST /api/copilot model=${resolvedModel} promptLength=${String(prompt).length} auth=${authHeader ? 'present' : 'missing'}`);

  // ── Gemini Provider ──
  if (config.AVAILABLE_MODELS_GEMINI.includes(resolvedModel)) {
    const activeGeminiKey = geminiKeyHeader || config.GEMINI_API_KEY;
    if (!activeGeminiKey) return res.status(500).json({ error: 'gemini_api_not_configured', detail: 'Missing GEMINI_API_KEY' });

    try {
      const text = await copilotService.sendPromptToGeminiAPI(activeGeminiKey, resolvedModel, wordPrompt);
      const parsedResponse = promptBuilder.parseAssistantResponse(text, officeContext);
      return res.json({ text: parsedResponse.text, officeActions: parsedResponse.officeActions, authMode: 'gemini', model: resolvedModel });
    } catch (err: any) {
      console.error('Gemini API error', err);
      return res.status(err.status || 500).json({ error: 'gemini_api_error', detail: err.detail || String(err) });
    }
  }

  // ── GitHub Models Provider ──
  const modelsToken = config.getModelsToken();
  const bearerTokenString = modelsToken ? modelsToken : authHeader.startsWith('Bearer ') ? authHeader.replace('Bearer ', '').trim() : '';

  if (bearerTokenString) {
    try {
      const text = await copilotService.sendPromptToGitHubModelsAPI(bearerTokenString, resolvedModel, wordPrompt);
      const parsedResponse = promptBuilder.parseAssistantResponse(text, officeContext);
      return res.json({ text: parsedResponse.text, officeActions: parsedResponse.officeActions, authMode: 'pat', model: resolvedModel });
    } catch (apiResError: any) {
      console.warn('Copilot Models API returned error:', apiResError.status, apiResError.detail);

      // Attempt SDK Fallback on rate-limit, auth, or server errors
      if (apiResError.status === 429 || apiResError.status === 401 || (apiResError.status >= 500 && apiResError.status < 600)) {
        try {
          const sdkToken = config.getServerPatToken();
          const fallbackText = await copilotService.sendPromptViaCopilotSdk(`${wordPrompt.system}\n\n${wordPrompt.user}`, sdkToken);
          if (fallbackText) {
            const parsedResponse = promptBuilder.parseAssistantResponse(fallbackText, officeContext);
            return res.json({ text: parsedResponse.text, officeActions: parsedResponse.officeActions, authMode: 'cli', model: copilotService.normalizeSdkModel(config.COPILOT_MODEL) });
          }
        } catch (fallbackError) {
          console.warn('CLI/SDK fallback failed:', fallbackError);
        }
      }

      return res.status(apiResError.status || 500).json({
        error: 'copilot_api_error',
        status: apiResError.status,
        detail: apiResError.status === 401 ? 'Unauthorized. Ensure PAT has GitHub Models access.' : apiResError.detail
      });
    }
  }

  // ── CLI/SDK Default Fallback ──
  try {
    const text = await copilotService.sendPromptViaCopilotSdk(`${wordPrompt.system}\n\n${wordPrompt.user}`, config.getServerPatToken());
    const parsedResponse = promptBuilder.parseAssistantResponse(text, officeContext);
    return res.json({ text: parsedResponse.text, officeActions: parsedResponse.officeActions, authMode: 'cli', model: copilotService.normalizeSdkModel(config.COPILOT_MODEL) });
  } catch (err: any) {
    console.error('Copilot SDK error', err);
    const sdkError = copilotService.describeCopilotSdkError(err);
    return res.status(sdkError.status).json({ error: sdkError.error, detail: sdkError.detail });
  }
});

export default apiRouter;
