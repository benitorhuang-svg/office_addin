import config from '../../../config/env.js';
import { fetch } from '../../../atoms/fetcher.js';
import { PromptPayload, ChatCompletionResponse } from '../atoms/types.js';
import { SSE_PARSER } from '../molecules/sse-parser.js';

/**
 * Organism: GitHub Models API Service (Inference).
 * Handles direct REST calls to GitHub's hosted models with AbortSignal support.
 */
export const GitHubModelsService = {
  async send(
    token: string, 
    model: string, 
    payload: PromptPayload & { signal?: AbortSignal }, 
    onChunk?: (chunk: string) => void
  ): Promise<string> {
    const url = config.GITHUB_MODELS_URL;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      signal: payload.signal,
      body: JSON.stringify({
        messages: [
          { role: 'system', content: payload.system },
          { role: 'user', content: payload.user }
        ],
        model: model,
        temperature: config.DEFAULT_TEMPERATURE,
        stream: Boolean(onChunk)
      }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({})) as ChatCompletionResponse;
      throw { status: response.status, detail: data?.error?.message || 'GitHub Models Error' };
    }

    if (onChunk) {
      const reader = response.body?.getReader();
      if (!reader) return '';
      
      let fullText = '';
      for await (const jsonString of SSE_PARSER.parse(reader)) {
        try {
          const data = JSON.parse(jsonString) as ChatCompletionResponse;
          const delta = data.choices?.[0]?.delta?.content || '';
          if (delta) {
            fullText += delta;
            onChunk(delta);
          }
        } catch { /* ignore */ }
      }
      return fullText;
    }

    const data = await response.json() as ChatCompletionResponse;
    return data?.choices?.[0]?.message?.content || '';
  }
};
