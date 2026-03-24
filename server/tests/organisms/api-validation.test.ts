import express from 'express';
import request from 'supertest';
import assert from 'assert';
import apiRouter from '../../routes/organisms/api-router.js';

function createApp() {
  const app = express();
  app.use(express.json());
  app.use('/api', apiRouter as any);
  return app;
}

function mockFetch(handler: (input: string | Request | URL, init?: RequestInit) => Promise<any>, calls?: string[]) {
  const fetchMock = async (input: string | Request | URL, init?: RequestInit) => {
    if (calls) {
      calls.push(String(input));
    }
    return handler(input, init);
  };
  (fetchMock as any)._isMock = true;
  // @ts-ignore
  globalThis.fetch = fetchMock;
}

describe('API routes - Gemini validation', () => {
  afterEach(() => {
    // @ts-ignore
    if (globalThis.fetch && (globalThis.fetch as any)._isMock) delete (globalThis.fetch as any);
  });

  it('validates a Gemini key by listing models instead of using a specific model', async () => {
    const calls: string[] = [];
    mockFetch(async () => {
      return {
        ok: true,
        status: 200,
        json: async () => ({ choices: [{ message: { content: 'ok' } }] }),
        text: async () => JSON.stringify({ choices: [{ message: { content: 'ok' } }] }),
        headers: new Headers({ 'content-type': 'application/json' }),
      } as any;
    }, calls);

    const app = createApp();
    const res = await request(app)
      .post('/api/gemini/validate')
      .send({ apiKey: 'fake-key-123' });

    assert.strictEqual(res.status, 200);
    assert.deepStrictEqual(res.body, { status: 200, detail: 'Gemini Key is valid' });
    assert.ok(calls.length > 0, 'fetch should have been called for validation');
    assert.match(calls[0] || '', /\?key=fake-key-123$/);
  });

  it('returns the upstream Gemini error when the key is invalid', async () => {
    mockFetch(async () => ({
      ok: false,
      status: 401,
      json: async () => ({ error: { message: 'Invalid API key' } }),
      text: async () => 'Invalid API key',
      headers: new Headers({ 'content-type': 'application/json' }),
    }) as any);

    const app = createApp();
    const res = await request(app)
      .post('/api/gemini/validate')
      .send({ apiKey: 'bad-key' });

    assert.strictEqual(res.status, 401);
    assert.deepStrictEqual(res.body, { status: 401, detail: 'Invalid API key' });
  });
});