import { fetch } from '@infra/atoms/fetcher.js';
import config from '@config/env.js';
import { SESSION_STORE } from '@api/molecules/session-store.js';

/**
 * Organism: OAuth Service
 * Handles the high-level logic for token exchange and redirect URLs.
 */
export const OAuthService = {
  getGitHubAuthorizeUrl(_sessionId: string, redirectUri: string, state: string, codeChallenge?: string): string {
    const clientId = config.GITHUB_CLIENT_ID;
    const scope = 'read:user';
    
    const params: Record<string, string> = { 
      client_id: clientId, 
      redirect_uri: redirectUri, 
      scope,
      state
    };
    if (codeChallenge) {
      params.code_challenge = codeChallenge;
      params.code_challenge_method = 'S256';
    }
    const searchParams = new URLSearchParams(params);
    return `https://github.com/login/oauth/authorize?${searchParams.toString()}`;
  },

  async exchangeGitHubCode(code: string, codeVerifier?: string): Promise<string> {
    const clientId = config.GITHUB_CLIENT_ID;
    const clientSecret = config.GITHUB_CLIENT_SECRET;

    const body: Record<string, string> = { client_id: clientId, client_secret: clientSecret, code };
    if (codeVerifier) {
      body.code_verifier = codeVerifier;
    }

    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
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
