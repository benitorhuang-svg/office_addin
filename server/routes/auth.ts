import express, { Request, Response, Router } from 'express';
import config from '../config/env.js';
import { fetch } from '../fetcher.js';

const authRouter: Router = express.Router();
const sessionStore = new Map<string, string>();

/**
 * Renders a premium polished status message HTML.
 */
function renderStatusHTML(title: string, message: string, color: string = '#0078D4', autoClose: boolean = false) {
  return `<!doctype html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${title}</title>
      <style>
        body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #fbfbfb; color: #333; }
        .card { background: white; padding: 40px; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.06); text-align: center; max-width: 400px; animation: slideIn 0.5s ease; border: 1px solid #eee; }
        .icon { font-size: 48px; color: ${color}; margin-bottom: 24px; }
        h3 { margin: 0 0 12px; font-weight: 600; font-size: 22px; }
        p { color: #666; line-height: 1.5; margin: 0 0 24px; }
        button { background: ${color}; color: white; border: none; padding: 12px 28px; border-radius: 6px; font-weight: 600; cursor: pointer; transition: filter 0.2s; }
        button:hover { filter: brightness(1.1); }
        @keyframes slideIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="icon">✨</div>
        <h3>${title}</h3>
        <p>${message}</p>
        <button onclick="window.close()">關閉視窗</button>
      </div>
      ${autoClose ? '<script>setTimeout(() => window.close(), 2000);</script>' : ''}
    </body>
    </html>`;
}

// Polling endpoint for session token
authRouter.get('/session/:id', (req: Request, res: Response) => {
  const id = req.params.id;
  if (!id) return res.status(400).json({ error: 'missing id' });
  const token = sessionStore.get(id) || '';
  res.json({ token });
});

// GitHub OAuth entry point
authRouter.get('/github', (req: Request, res: Response) => {
  const clientId = config.GITHUB_CLIENT_ID;
  const sessionId = (req.query.session as string) || '';
  const redirectUri = `${req.protocol}://${req.get('host')}/auth/callback`;
  const scope = 'read:user';

  if (!clientId || clientId === 'your_github_oauth_client_id_here') {
    return res.status(200).send(renderStatusHTML('OAuth Not Configured', 'GitHub OAuth is not configured on the server. Please set GITHUB_CLIENT_ID and SECRET.', '#D93025'));
  }

  const params = new URLSearchParams({ client_id: clientId, redirect_uri: redirectUri, scope });
  if (sessionId) params.set('state', sessionId);
  res.redirect(`https://github.com/login/oauth/authorize?${params.toString()}`);
});

// GitHub OAuth callback
authRouter.get('/callback', async (req: Request, res: Response) => {
  const code = req.query.code as string;
  const sessionId = (req.query.session as string) || (req.query.state as string) || '';
  const clientId = config.GITHUB_CLIENT_ID;
  const clientSecret = config.GITHUB_CLIENT_SECRET;

  if (!code) return res.status(400).send('Missing code');
  if (!clientId || !clientSecret) {
    return res.status(200).send(renderStatusHTML('Configuration Error', 'Missing GitHub credentials.', '#D93025'));
  }

  let accessToken = '';
  try {
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code }),
    });
    const tokenJson: any = await tokenRes.json();
    accessToken = tokenJson.access_token || '';
  } catch (err) {
    return res.status(500).send('Token exchange failed');
  }

  if (sessionId && accessToken) {
    sessionStore.set(sessionId, accessToken);
    setTimeout(() => sessionStore.delete(sessionId), 60 * 1000);
  }

  res.send(renderStatusHTML('已成功連線 GitHub', '您的帳號已成功授權，現在可以關閉此視窗並開始使用了。', '#0078D4', true));
});

export default authRouter;
