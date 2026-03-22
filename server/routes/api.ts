import express, { Request, Response, Router } from 'express';
import config from '../config/env.js';
import * as promptBuilder from '../services/promptBuilder.js';
import * as copilotService from '../services/copilot/index.js';

const apiRouter: Router = express.Router();

apiRouter.get('/health', async (_req: Request, res: Response) => {
  const agent = await copilotService.checkAgentHealth();
  const hasGeminiKey = Boolean(config.GEMINI_API_KEY);
  const hasAzureKey = Boolean(config.AZURE_OPENAI_API_KEY);

  res.json({
    ok: true,
    agent,
    gemini: { configured: hasGeminiKey },
    azure: { configured: hasAzureKey },
    timestamp: new Date().toISOString()
  });
});

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
    await copilotService.validateGeminiApiKey(geminiKeyHeader);
    res.json({ ok: true, message: 'API key is valid' });
  } catch (err: any) {
    console.error("[Gemini Validation Failed]", err);
    res.status(err.status || 401).json({ ok: false, message: err.detail || 'Invalid API key' });
  }
});

apiRouter.post('/copilot', async (req: Request, res: Response) => {
  const { prompt, officeContext, model, presetId, writingPresetId, stream } = req.body || {};
  if (!prompt) return res.status(400).json({ error: 'missing prompt' });

  const authHeader = req.headers.authorization || '';
  const geminiKeyHeader = (req.headers['x-gemini-key'] as string) || '';
  const azureInfo = {
    apiKey: (req.headers['x-azure-key'] as string) || '',
    endpoint: (req.headers['x-azure-endpoint'] as string) || '',
    deployment: (req.headers['x-azure-deployment'] as string) || '',
  };

  const resolvedModel = config.AVAILABLE_MODELS.includes(model) ? model : config.COPILOT_MODEL;
  const wordPrompt = promptBuilder.buildWordPrompt(prompt, officeContext, resolvedModel, presetId || writingPresetId);

  // Helper for SSE Streaming Header
  const setupSSE = () => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();
  };

  // ── Route Selection ──
  const authProvider = req.body.authProvider; // 'github_pat' | 'copilot_cli' | 'gemini_api' | 'preview'
  const isGeminiModel = config.AVAILABLE_MODELS_GEMINI.includes(resolvedModel);
  const useNativeGemini = isGeminiModel && (authProvider === 'gemini_api' || !authProvider);

  // ── Gemini Native Provider (Method 1 in some contexts, but separate from SDK) ──
  if (useNativeGemini) {
    const activeGeminiKey = geminiKeyHeader || config.GEMINI_API_KEY;
    if (!activeGeminiKey) return res.status(500).json({ error: 'gemini_api_not_configured' });

    try {
      if (stream) {
        setupSSE();
        const generator = copilotService.streamPromptFromGeminiAPI(activeGeminiKey, resolvedModel, wordPrompt);
        for await (const chunk of generator) {
          res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
        }
        res.write('data: [DONE]\n\n');
        return res.end();
      } else {
        const text = await copilotService.sendPromptToGeminiAPI(activeGeminiKey, resolvedModel, wordPrompt);
        const parsed = promptBuilder.parseAssistantResponse(text, officeContext);
        return res.json({ text: parsed.text, officeActions: parsed.officeActions, authMode: 'gemini', model: resolvedModel });
      }
    } catch (err: any) {
      const status = err.status || 500;
      const detail = err.detail || err.message || 'Unknown Gemini error';
      if (res.headersSent) {
        res.write(`data: ${JSON.stringify({ error: 'gemini_error', detail })}\n\n`);
        return res.end();
      }
      return res.status(status).json({ error: 'gemini_error', detail });
    }
  }

  // ── GitHub Models / SDK Provider ──
  const bearerTokenString = (authHeader.startsWith('Bearer ') ? authHeader.replace('Bearer ', '').trim() : '');

  try {
    if (stream) {
      setupSSE();
      const onChunk = (chunk: string) => {
        res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
      };
      
      // Strict Routing based on Provider
      console.log(`[Copilot API] Provider: ${authProvider}, Model: ${resolvedModel}, Stream: ${stream}`);
      
      if (authProvider === 'copilot_cli' || authProvider === 'gemini_cli') {
        const isGemini = authProvider === 'gemini_cli';
        console.log(`[Copilot API] Routing to SDK (${isGemini ? 'Gemini ' : ''}CLI Mode) with model: ${resolvedModel}`);
        await copilotService.sendPromptViaCopilotSdk(prompt, '', onChunk, true, resolvedModel, azureInfo);
      } else if (bearerTokenString || config.getModelsToken()) {
        const token = bearerTokenString || config.getModelsToken();
        console.log(`[Copilot API] Routing to GitHub Models API`);
        await copilotService.sendPromptToGitHubModelsAPI(token, resolvedModel, wordPrompt, onChunk);
      } else {
        console.log(`[Copilot API] Routing to SDK (Fallback Mode)`);
        await copilotService.sendPromptViaCopilotSdk(prompt, config.getServerPatToken(), onChunk, false, resolvedModel, azureInfo);
      }
      res.write('data: [DONE]\n\n');
      return res.end();
    } else {
      let text: string;
      let authMode = 'pat';

      if (authProvider === 'copilot_cli' || authProvider === 'gemini_cli') {
        text = await copilotService.sendPromptViaCopilotSdk(prompt, '', undefined, true, resolvedModel, azureInfo);
        authMode = 'cli';
      } else if (bearerTokenString || config.getModelsToken()) {
        const token = bearerTokenString || config.getModelsToken();
        text = await copilotService.sendPromptToGitHubModelsAPI(token, resolvedModel, wordPrompt);
      } else {
        text = await copilotService.sendPromptViaCopilotSdk(prompt, config.getServerPatToken(), undefined, false, resolvedModel, azureInfo);
        authMode = 'cli';
      }
      
      const parsed = promptBuilder.parseAssistantResponse(text, officeContext);
      return res.json({ text: parsed.text, officeActions: parsed.officeActions, authMode, model: resolvedModel });
    }
  } catch (err: any) {
    const status = err.status || 500;
    const errorMsg = err.error || 'provider_error';
    const detail = err.detail || err.message || JSON.stringify(err);
    console.error(`[API Error] Status: ${status}, Detail: ${detail}`);
    if (res.headersSent) {
      res.write(`data: ${JSON.stringify({ error: errorMsg, detail })}\n\n`);
      return res.end();
    }
    return res.status(status).json({ error: errorMsg, detail });
  }
});

export default apiRouter;
