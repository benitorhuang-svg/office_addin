import express from 'express';
import request from 'supertest';
import assert from 'assert';
import authRouter from '../../routes/organisms/auth-router.js';

// Create a fresh express app for each test to avoid server startup
function createApp() {
  const app = express();
  app.use('/auth', authRouter as any);
  return app;
}

describe('Auth routes - GitHub OAuth', () => {
  const ORIGINAL_GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
  const ORIGINAL_GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

  afterEach(() => {
    process.env.GITHUB_CLIENT_ID = ORIGINAL_GITHUB_CLIENT_ID;
    process.env.GITHUB_CLIENT_SECRET = ORIGINAL_GITHUB_CLIENT_SECRET;
    // clear any global fetch mocks
    // @ts-ignore
    if (globalThis.fetch && (globalThis.fetch as any)._isMock) delete (globalThis.fetch as any);
  });

  it('returns informative HTML when GitHub OAuth is not configured', async () => {
    process.env.GITHUB_CLIENT_ID = '';
    const app = createApp();

    const res = await request(app).get('/auth/github');
    assert.strictEqual(res.status, 200);
    assert.match(res.text, /OAuth Not Configured/);
  });

  it('redirects to GitHub authorize when client id is provided', async () => {
    process.env.GITHUB_CLIENT_ID = 'fake-client-id-123';
    const app = createApp();

    const res = await request(app).get('/auth/github').query({ session: 'mysession' }).redirects(0);
    assert.strictEqual(res.status, 302);
    assert.match(res.headers.location, /^https:\/\/github.com\/login\/oauth\/authorize\?/);
    assert.match(res.headers.location, /client_id=fake-client-id-123/);
    assert.match(res.headers.location, /state=mysession/);
  });
});
