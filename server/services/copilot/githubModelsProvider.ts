import { fetch } from '../../fetcher.js';
import { PromptPayload } from './types.js';

/**
 * Handles GitHub Models API (Inference).
 */
export async function sendPromptToGitHubModelsAPI(
  token: string, 
  model: string, 
  payload: PromptPayload, 
  onChunk?: (chunk: string) => void
): Promise<string> {
  const url = 'https://models.github.ai/inference/chat/completions';
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      messages: [
        { role: 'system', content: payload.system },
        { role: 'user', content: payload.user }
      ],
      model: model,
      temperature: 0.7,
      stream: Boolean(onChunk)
    }),
  });

  if (!response.ok) {
    const data: any = await response.json().catch(() => ({}));
    throw { status: response.status, detail: data?.error?.message || 'GitHub Models Error' };
  }

  if (onChunk) {
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let fullText = '';
    while (reader) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const content = line.substring(6).trim();
          if (content === '[DONE]') break;
          try {
            const data = JSON.parse(content);
            const delta = data.choices?.[0]?.delta?.content || '';
            fullText += delta;
            onChunk(delta);
          } catch { /* ignore */ }
        }
      }
    }
    return fullText;
  }

  const data: any = await response.json();
  return data?.choices?.[0]?.message?.content || '';
}
