import { fetch } from '@infra/atoms/fetcher.js';
import config from '@config/env.js';
import { SESSION_STORE } from '@api/molecules/session-store.js';

/**
 * Organism: OAuth Service
 * Handles the high-level logic for token exchange and redirect URLs.
 */
export const OAuthService = {
  getGitHubAuthorizeUrl(sessionId: string, redirectUri: string): string {
    const clientId = config.GITHUB_CLIENT_ID;
    const scope = 'read:user';
    
    const params = new URLSearchParams({ 
      client_id: clientId, 
      redirect_uri: redirectUri, 
      scope,
      state: sessionId 
    });
    return `https://github.com/login/oauth/authorize?${params.toString()}`;
  },

  async exchangeGitHubCode(code: string): Promise<string> {
    const clientId = config.GITHUB_CLIENT_ID;
    const clientSecret = config.GITHUB_CLIENT_SECRET;

    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code }),
    });

    const tokenJson = await tokenRes.json() as Record<string, string>;
    const accessToken = tokenJson.access_token || '';
    
    if (!accessToken) {
        throw new Error('Token exchange failed: No access_token returned');
    }
    return accessToken;
  },

  finalizeSession(sessionId: string, token: string) {
    if (sessionId && token) {
      SESSION_STORE.set(sessionId, token);
    }
  }
};
