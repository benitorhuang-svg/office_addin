import { fetch } from '../../../atoms/fetcher.js';
import config from '../../../config/env.js';
import { PromptPayload, ChatCompletionResponse } from '../atoms/types.js';
import { SSE_PARSER } from '../molecules/sse-parser.js';

/**
 * Organism: Native Gemini REST API Client.
 * Handles the OpenAI-compatible endpoint on Google's cloud.
 */
export const GeminiRestService = {
  /**
   * Non-streaming call
   */
  async send(apiKey: string, model: string, payload: PromptPayload & { signal?: AbortSignal }): Promise<string> {
    const modelId = model.replace(/^models\//, '');
    const url = `${config.GEMINI_REST_URL}?key=${apiKey}`;

    const headers = {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'Authorization': `Bearer ${apiKey}`,
    };

    const response = await fetch(url, {
      method: 'POST',
      headers,
      signal: payload.signal,
      body: JSON.stringify({
        model: modelId,
        messages: [
          { role: 'system', content: payload.system },
          { role: 'user', content: payload.user }
        ],
        temperature: config.DEFAULT_TEMPERATURE,
        max_tokens: config.MAX_TOKENS
      }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({})) as ChatCompletionResponse;
      throw { status: response.status, detail: data?.error?.message || 'Gemini REST Error' };
    }
    const data = await response.json() as ChatCompletionResponse;
    return data?.choices?.[0]?.message?.content || '';
  },

  /**
   * SSE Streaming Generator
   */
  async *stream(apiKey: string, model: string, payload: PromptPayload & { signal?: AbortSignal }): AsyncGenerator<string> {
    const modelId = model.replace(/^models\//, '');
    const url = `${config.GEMINI_REST_URL}?key=${apiKey}`;

    const headers = {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'Authorization': `Bearer ${apiKey}`,
    };

    const response = await fetch(url, {
      method: 'POST',
      headers,
      signal: payload.signal,
      body: JSON.stringify({
        model: modelId,
        messages: [
          { role: 'system', content: payload.system },
          { role: 'user', content: payload.user }
        ],
        temperature: config.DEFAULT_TEMPERATURE,
        max_tokens: config.MAX_TOKENS,
        stream: true
      }),
    });

    if (!response.ok) {
      const raw = await response.text().catch(() => '');
      let errorMsg = 'Gemini SSE Error';
      try {
        const errorData = JSON.parse(raw) as ChatCompletionResponse;
        errorMsg = errorData?.error?.message || raw || errorMsg;
      } catch {
        errorMsg = raw || errorMsg;
      }
      console.warn('[Gemini REST] SSE error', response.status, errorMsg);

      if (response.status === 400 || String(errorMsg).toLowerCase().includes('provider_error')) {
        try {
          const nonStreamResult = await this.send(apiKey, model, payload);
          yield nonStreamResult;
          return;
        } catch (err) {
          const e = err as { status?: number; detail?: string };
          throw { status: e.status || response.status, detail: e.detail || errorMsg };
        }
      }

      throw { status: response.status, detail: errorMsg };
    }

    const reader = response.body?.getReader();
    if (!reader) return;

    for await (const jsonString of SSE_PARSER.parse(reader)) {
      try {
        const json = JSON.parse(jsonString) as ChatCompletionResponse;
        const text = json.choices?.[0]?.delta?.content || '';
        if (text) yield text;
      } catch { /* ignored */ }
    }
  },

  /**
   * Key Probe (Validation)
   */
  async validate(apiKey: string): Promise<void> {
    const models = config.AVAILABLE_MODELS_GEMINI;
    let lastErr: unknown = null;
    for (const m of models) {
      try {
        await this.send(apiKey, m, { system: 'Validation', user: 'hi' });
        return;
      } catch (err: unknown) {
        lastErr = err;
        const error = err as { status?: number };
        if (error?.status === 401 || error?.status === 403) throw err;
      }
    }
    throw lastErr || { status: 401, detail: 'Gemini Key validation failed' };
  }
};
