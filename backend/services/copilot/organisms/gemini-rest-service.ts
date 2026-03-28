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
   * Internal Helper: Prepend models/ if missing for Native API
   */
  mapModel(model: string): string {
    const raw = model.toLowerCase();
    if (raw.startsWith('models/')) return raw;
    return `models/${raw}`;
  },

  /**
   * Non-streaming call
   */
  async send(apiKey: string, model: string, payload: PromptPayload & { signal?: AbortSignal }): Promise<string> {
    const modelId = this.mapModel(model);
    const url = `https://generativelanguage.googleapis.com/v1beta/${modelId}:generateContent?key=${apiKey}`;

    const body = {
      contents: [{ parts: [{ text: payload.user || '' }] }],
      system_instruction: payload.system ? { parts: [{ text: payload.system }] } : undefined,
      generationConfig: {
        temperature: Number(config.DEFAULT_TEMPERATURE),
        maxOutputTokens: Number(config.MAX_TOKENS)
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: payload.signal,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({})) as any;
      const errorDetail = data?.error?.message || (Array.isArray(data) ? data[0]?.error?.message : null) || 'Gemini Native Error';
      throw { status: response.status, detail: errorDetail };
    }
    const data = await response.json() as any;
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  },

  /**
   * SSE Streaming Generator (Gemini Native Implementation)
   */
  async *stream(apiKey: string, model: string, payload: PromptPayload & { signal?: AbortSignal }): AsyncGenerator<string> {
    const modelId = this.mapModel(model);
    const url = `https://generativelanguage.googleapis.com/v1beta/${modelId}:streamGenerateContent?alt=sse&key=${apiKey}`;

    console.log(`[Gemini Native] STREAMING REQUEST: model=${modelId}`);

    const body = {
      contents: [{ parts: [{ text: payload.user || '' }] }],
      system_instruction: payload.system ? { parts: [{ text: payload.system }] } : undefined,
      generationConfig: {
        temperature: Number(config.DEFAULT_TEMPERATURE),
        maxOutputTokens: Number(config.MAX_TOKENS)
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: payload.signal,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
        const raw = await response.text().catch(() => '');
        throw { status: response.status, detail: raw || 'Gemini Native Stream Error' };
    }

    const reader = response.body?.getReader();
    if (!reader) return;

    // Gemini Native SSE format sends chunks directly. 
    // Data line format: "data: {"candidates": ...}"
    for await (const line of SSE_PARSER.parse(reader)) {
      try {
        const json = JSON.parse(line) as any;
        const text = json.candidates?.[0]?.content?.parts?.[0]?.text || '';
        if (text) yield text;
      } catch (e) {
        // Handle unexpected parsing errors gracefully
      }
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
