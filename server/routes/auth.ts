import express, { Request, Response, Router } from 'express';
import config from '../config/env.js';
import { renderStatusHTML } from './atoms/status-html.js';
import { SESSION_STORE } from './molecules/session-store.js';
import { OAuthService } from './organisms/oauth-service.js';

/**
 * Organism: Auth Router
 * Coordinates the full OAuth lifecycle using specialized Atoms and Molecules.
 */
const authRouter: Router = express.Router();

/**
 * Endpoint: Polling for session token
 */
authRouter.get('/session/:id', (req: Request, res: Response) => {
  const id = req.params.id;
  if (!id) return res.status(400).json({ error: 'missing id' });
  const token = SESSION_STORE.get(id) || '';
  res.json({ token });
});

/**
 * Endpoint: GitHub OAuth entry point
 */
authRouter.get('/github', (req: Request, res: Response) => {
  const clientId = config.GITHUB_CLIENT_ID;
  const sessionId = (req.query.session as string) || '';
  const redirectUri = `${req.protocol}://${req.get('host')}/auth/callback`;

  if (!clientId || clientId === 'your_github_oauth_client_id_here') {
    return res.status(200).send(renderStatusHTML(
      'OAuth Not Configured', 
      'GitHub OAuth is not configured on the server.', 
      '#D93025'
    ));
  }

  const url = OAuthService.getGitHubAuthorizeUrl(sessionId, redirectUri);
  res.redirect(url);
});

/**
 * Endpoint: GitHub OAuth callback
 */
authRouter.get('/callback', async (req: Request, res: Response) => {
  const code = req.query.code as string;
  const sessionId = (req.query.session as string) || (req.query.state as string) || '';

  if (!code) return res.status(400).send('Missing code');

  try {
    const accessToken = await OAuthService.exchangeGitHubCode(code);
    OAuthService.finalizeSession(sessionId, accessToken);

    res.send(renderStatusHTML(
      '已成功連線 GitHub', 
      '您的帳號已成功授權，現在可以關閉此視窗。', 
      '#0078D4', 
      true
    ));
  } catch (err: any) {
    console.error(`[OAuth Callback Error]`, err);
    res.status(500).send(renderStatusHTML(
      '連線失敗', 
      `發生錯誤：${err.message}`, 
      '#D93025'
    ));
  }
});

export default authRouter;
