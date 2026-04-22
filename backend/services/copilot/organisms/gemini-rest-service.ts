import { fetch } from '../../../atoms/fetcher.js';
import config from '../../../config/env.js';
import type { PromptPayload } from '../atoms/types.js';
import { SSE_PARSER } from '../molecules/sse-parser.js';
import { logger } from '../../../atoms/logger.js';

interface GeminiContentPart {
  text?: string;
}

interface GeminiCandidate {
  content?: {
    parts?: GeminiContentPart[];
  };
}

interface GeminiErrorResponse {
  error?: {
    message?: string;
  };
}

interface GeminiGenerateResponse {
  candidates?: GeminiCandidate[];
}

/**
 * Organism: Native Gemini REST API Client.
 * Handles the OpenAI-compatible endpoint on Google's cloud.
 */
export const GeminiRestService = {
  /**
   * Internal Helper: Prepend models/ if missing for Native API
   */
  /**
   * Internal Helper: Map UI Model Names to Official API IDs
   * EVOLUTION: Respecting version numbers (3.1, 2.5, etc.) via slugification.
   */
  mapModel(model: string): string {
    // Standardize: Lowercase and replace spaces/underscores with hyphens
    const slug = model.toLowerCase().trim().replace(/[\s_]+/g, '-');
    
    // Ensure the models/ prefix exists for the native Gemini API
    if (slug.startsWith('models/')) return slug;
    return `models/${slug}`;
  },

  async parseErrorDetail(response: Response, fallbackMessage: string): Promise<string> {
    const raw = await response.text().catch(() => '');
    if (!raw) return fallbackMessage;

    try {
      const data = JSON.parse(raw) as GeminiErrorResponse;
      const error = data.error;
      return error?.message || raw;
    } catch {
      return raw;
    }
  },

  /**
   * Non-streaming call
   */
  async send(apiKey: string, model: string, payload: PromptPayload & { signal?: AbortSignal }): Promise<string> {
    const modelId = this.mapModel(model);
    const url = `https://generativelanguage.googleapis.com/v1beta/${modelId}:generateContent?key=${apiKey}`;
    logger.info('GeminiRest', 'Sending non-streaming Gemini REST request', { modelId });

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
      const errorDetail = await this.parseErrorDetail(response, 'Gemini Native Error');
      logger.warn('GeminiRest', 'Gemini REST request failed', {
        modelId,
        status: response.status,
        detail: errorDetail,
      });
      throw { status: response.status, detail: errorDetail };
    }
    const data = await response.json() as GeminiGenerateResponse;
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  },

  /**
   * SSE Streaming Generator (Gemini Native Implementation)
   */
  async *stream(apiKey: string, model: string, payload: PromptPayload & { signal?: AbortSignal }): AsyncGenerator<string> {
    const modelId = this.mapModel(model);
    const url = `https://generativelanguage.googleapis.com/v1beta/${modelId}:streamGenerateContent?alt=sse&key=${apiKey}`;
    logger.info('GeminiRest', 'Starting streaming Gemini REST request', { modelId });

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
      const errorDetail = await this.parseErrorDetail(response, 'Gemini Native Stream Error');
      logger.warn('GeminiRest', 'Gemini streaming request failed', {
        modelId,
        status: response.status,
        detail: errorDetail,
      });
      throw { status: response.status, detail: errorDetail };
    }

    const reader = response.body?.getReader();
    if (!reader) return;

    // Gemini Native SSE format sends chunks directly. 
    // Data line format: "data: {"candidates": ...}"
    let parseErrorLogged = false;
    for await (const line of SSE_PARSER.parse(reader)) {
      try {
        const json = JSON.parse(line) as GeminiGenerateResponse;
        const text = json.candidates?.[0]?.content?.parts?.[0]?.text || '';
        if (text) yield text;
      } catch (e: unknown) {
        if (!parseErrorLogged) {
          parseErrorLogged = true;
          logger.warn('GeminiRest', 'Failed to parse SSE chunk from Gemini stream', {
            modelId,
            error: e,
          });
        }
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
    logger.warn('GeminiRest', 'Gemini API key validation exhausted all configured models', {
      models,
      error: lastErr,
    });
    throw lastErr || { status: 401, detail: 'Gemini Key validation failed' };
  }
};
