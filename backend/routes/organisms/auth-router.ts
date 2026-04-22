import express, { type Request, type Response } from 'express';
import config from '../../config/env.js';
import { renderStatusHTML } from '../atoms/status-html.js';
import { SESSION_STORE } from '../molecules/session-store.js';
import { OAuthService } from './oauth-service.js';
import { logger } from '../../atoms/logger.js';

interface GeminiModelsResponse {
  models?: unknown[];
  error?: {
    message?: string;
  };
}

interface GitHubUserResponse {
  login?: string;
  message?: string;
}

/**
 * Organism: Auth Router
 * Coordinates the full OAuth lifecycle using specialized Atoms and Molecules.
 */
const authRouter = express.Router();

/**
 * Endpoint: Polling for session token
 */
authRouter.get('/session/:id', (req: Request, res: Response): void => {
  const id = req.params.id;
  if (!id || typeof id !== 'string') {
    res.status(400).json({ error: 'missing id' });
    return;
  }
  const token = SESSION_STORE.get(id) || '';

  res.json({ token });
});

/**
 * Endpoint: GitHub OAuth entry point
 */
authRouter.get('/github', (req: Request, res: Response): void => {
  const clientId = config.GITHUB_CLIENT_ID;
  const sessionId = (req.query.session as string) || '';
  const redirectUri = `${req.protocol}://${req.get('host')}/auth/callback`;

  if (!clientId || clientId === 'your_github_oauth_client_id_here') {
    res.status(200).send(renderStatusHTML(
      'OAuth Not Configured', 
      'GitHub OAuth is not configured on the server.', 
      '#D93025'
    ));
    return;
  }

  const url = OAuthService.getGitHubAuthorizeUrl(sessionId, redirectUri);
  res.redirect(url);
});

/**
 * Endpoint: GitHub OAuth callback
 */
authRouter.get('/callback', async (req: Request, res: Response): Promise<void> => {
  const code = req.query.code as string;
  const sessionId = (req.query.session as string) || (req.query.state as string) || '';

  if (!code) {
    res.status(400).send('Missing code');
    return;
  }

  try {
    const accessToken = await OAuthService.exchangeGitHubCode(code);
    OAuthService.finalizeSession(sessionId, accessToken);

    res.send(renderStatusHTML(
      '已成功連線 GitHub', 
      '您的帳號已成功授權，現在可以關閉此視窗。', 
      '#0078D4', 
      true
    ));
  } catch (err: unknown) {
    const error = err as Error;
    logger.error('AuthRouter', 'OAuth callback failed', { error });
    res.status(500).send(renderStatusHTML(
      '連線失敗', 
      `發生錯誤：${error.message}`, 
      '#D93025'
    ));
  }
});

/**
 * Endpoint: Verify Gemini API Key (Real Check)
 */
authRouter.post('/verify/gemini', async (req: Request, res: Response): Promise<void> => {
  const { key } = req.body;
  if (!key) { res.status(400).json({ error: 'missing key' }); return; }

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
    const data = await response.json() as GeminiModelsResponse;
    if (response.ok && data.models) {
      res.json({ success: true, models: data.models.length });
    } else {
      res.status(401).json({ error: data.error?.message || 'Invalid API Key' });
    }
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

/**
 * Endpoint: Verify GitHub PAT (Real Check)
 */
authRouter.post('/verify/github', async (req: Request, res: Response): Promise<void> => {
  const { token } = req.body;
  if (!token) { res.status(400).json({ error: 'missing token' }); return; }

  try {
    const response = await fetch('https://api.github.com/user', {
      headers: { 'Authorization': `token ${token}`, 'User-Agent': 'Nexus-Center-Industrial' }
    });
    const data = await response.json() as GitHubUserResponse;
    if (response.ok && data.login) {
      res.json({ success: true, login: data.login });
    } else {
      res.status(401).json({ error: data.message || 'Invalid GitHub Token' });
    }
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

export default authRouter;
