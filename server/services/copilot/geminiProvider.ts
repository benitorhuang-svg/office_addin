import { fetch } from '../../fetcher.js';
import { PromptPayload } from './types.js';
import { getAdaptiveConfig } from './adaptiveConfig.js';
import config from '../../config/env.js';

/**
 * Handles Native Google Gemini API (REST/SSE Stream).
 */
export async function sendPromptToGeminiAPI(
  apiKey: string, 
  model: string, 
  payload: PromptPayload,
  envType: string = 'commercial'
): Promise<string> {
  const modelId = model.replace(/^models\//, '');
  const url = `https://generativelanguage.googleapis.com/v1beta/openai/chat/completions?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: modelId,
      messages: [
        { role: 'system', content: payload.system },
        { role: 'user', content: payload.user }
      ],
      temperature: 0.7,
      max_tokens: 2048
    }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw { status: response.status, detail: data?.error?.message || 'Gemini REST Error' };
  }
  const data: any = await response.json();
  return data?.choices?.[0]?.message?.content || '';
}

export async function* streamPromptFromGeminiAPI(
  apiKey: string, 
  model: string, 
  payload: PromptPayload
): AsyncGenerator<string> {
  const modelId = model.replace(/^models\//, '');
  const url = `https://generativelanguage.googleapis.com/v1beta/openai/chat/completions?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: modelId,
      messages: [
        { role: 'system', content: payload.system },
        { role: 'user', content: payload.user }
      ],
      temperature: 0.7,
      max_tokens: 2048,
      stream: true
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw { status: response.status, detail: errorData?.error?.message || 'Gemini SSE Error' };
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (reader) {
    const { done, value } = await reader.read();
    if (done) break;
    
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const cleaned = line.trim();
      if (!cleaned || cleaned === 'data: [DONE]') continue;
      if (cleaned.startsWith('data: ')) {
        try {
          const json = JSON.parse(cleaned.substring(6));
          const text = json.choices?.[0]?.delta?.content || '';
          if (text) yield text;
        } catch { /* ignored partials */ }
      }
    }
  }
}

/**
 * Key validation helper.
 */
export async function validateGeminiApiKey(apiKey: string): Promise<void> {
  const candidateModels = config.AVAILABLE_MODELS_GEMINI;
  let lastError: any = null;

  for (const model of candidateModels) {
    try {
      await sendPromptToGeminiAPI(apiKey, model, { system: 'Validation', user: 'hi' });
      return;
    } catch (error: any) {
      lastError = error;
      if (error?.status === 401 || error?.status === 403) throw error;
      // Skip 404/not-supported models
    }
  }
  throw lastError || { status: 401, detail: 'Gemini Key validation failed' };
}
