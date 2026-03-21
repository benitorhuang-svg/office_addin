import { fetch } from '../fetcher.js';
import path from 'node:path';
import config from '../config/env.js';

export interface PromptPayload {
  system: string;
  user: string;
}

// 2026 Adaptive Environment Configuration
export interface AgentEnvironment {
  type: 'commercial' | 'gcc' | 'consumer' | 'preview';
  apiVersion?: string;
  endpointUrl?: string;
  securityMode?: 'high' | 'standard';
}

/**
 * Resolves the appropriate environment configuration based on context or headers.
 * Following 2026 Adaptive Design patterns.
 */
export function getAdaptiveConfig(loginEnv: string = 'commercial'): AgentEnvironment {
  switch (loginEnv.toLowerCase()) {
    case 'gcc':
      return {
        type: 'gcc',
        apiVersion: 'v1',
        endpointUrl: 'https://generativelanguage.googleapis.com/v1',
        securityMode: 'high',
      };
    case 'preview':
      return {
        type: 'preview',
        apiVersion: 'v1beta',
        endpointUrl: 'https://generativelanguage.googleapis.com/v1beta',
        securityMode: 'standard',
      };
    default:
      return {
        type: 'commercial',
        apiVersion: 'v1beta',
        endpointUrl: 'https://generativelanguage.googleapis.com/v1beta',
        securityMode: 'standard',
      };
  }
}

export async function validateGeminiApiKey(
  apiKey: string,
  envType: string = 'commercial'
): Promise<void> {
  const candidateModels = Array.from(
    new Set([
      ...config.AVAILABLE_MODELS_GEMINI,
      'gemini-3-pro-preview',
      'gemini-3-flash-preview',
      'gemini-2.5-flash',
      'gemini-2.5-pro',
      'gemini-2.0-flash',
      'gemini-1.5-pro',
    ].map(model => model.replace(/^models\//, '').trim()).filter(Boolean))
  );

  let lastError: any = null;

  for (const model of candidateModels) {
    try {
      await sendPromptToGeminiAPI(apiKey, model, {
        system: 'You are a validator for office_Agent.',
        user: 'ok',
      }, envType);
      return;
    } catch (error: any) {
      lastError = error;
      const status = error?.status || 500;
      const detail = String(error?.detail || error?.message || '');
      const isAuthError = status === 401 || status === 403 || /invalid authentication|unauthenticated|forbidden/i.test(detail);
      if (isAuthError) {
        throw error;
      }

      const isModelMismatch =
        status === 404 ||
        /not found|unsupported.*generateContent|model/i.test(detail) ||
        /modelservice\.listmodels/i.test(detail);

      if (!isModelMismatch) {
        throw error;
      }
    }
  }

  throw lastError || { status: 401, detail: 'Gemini API key validation failed' };
}

export async function sendPromptToGeminiAPI(
  apiKey: string, 
  model: string, 
  payload: PromptPayload,
  envType: string = 'commercial'
): Promise<string> {
  // For OpenAI compatibility endpoint, many libraries/proxies expect the bare model name (e.g. 'gemini-1.5-flash')
  const modelId = model.replace(/^models\//, '');
  // Using the OpenAI-compatible endpoint for ACP compliance + native key param for safety
  const url = `https://generativelanguage.googleapis.com/v1beta/openai/chat/completions?key=${apiKey}`;
  const prompt = `${payload.system}\n\n${payload.user}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}` // OpenAI format uses Bearer token
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

  let data: any;
  try {
    data = await response.json();
  } catch (e) {
    const rawText = await response.text().catch(() => "N/A");
    console.error("[Gemini API Decode Error]", rawText);
    throw { status: response.status, detail: `Invalid API response: ${rawText.slice(0, 100)}` };
  }

  if (!response.ok) {
    console.error("[Gemini OpenAI Error]", JSON.stringify(data, null, 2));
    const errorMsg = data?.error?.message || data?.message || 'Gemini OpenAI-Compat API Error';
    throw { status: response.status, detail: errorMsg };
  }
  return data?.choices?.[0]?.message?.content || '';
}

export async function* streamPromptFromGeminiAPI(
  apiKey: string, 
  model: string, 
  payload: PromptPayload,
  envType: string = 'commercial'
): AsyncGenerator<string> {
  const modelId = model.replace(/^models\//, '');
  // Using OpenAI-compatible SSE stream for ACP compliance + native key param for safety
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
    throw { status: response.status, detail: errorData?.error?.message || 'Gemini OpenAI Streaming Error' };
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
        } catch { /* ignore partial/malformed JSON */ }
      }
    }
  }
}

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

import { CopilotClient } from "@github/copilot-sdk";

export async function sendPromptViaCopilotSdk(
  prompt: string,
  token: string, 
  onChunk?: (chunk: string) => void,
  isExplicitCli: boolean = false,
  modelName: string = "gpt-4o-mini"
): Promise<string> {
  const isCliAuth = isExplicitCli || (token && token.length > 20);
  
  // ── Official SDK Strategy ──
  if (isCliAuth) {
    try {
      // Manually resolve CLI path to avoid import.meta.resolve bug in some Node/ESM/tsx environments
      const repoRoot = process.cwd();
      const manualCliPath = path.resolve(repoRoot, "node_modules/@github/copilot/index.js");
      
      const client = new CopilotClient({
        cliPath: manualCliPath
      });
      await client.start();
      
      const session = await (client as any).createSession({ 
        model: modelName,
        onPermissionRequest: async () => ({ grant: true })
      });

      if (onChunk) {
        const response = await session.send({ prompt });
        console.log("[SDK Raw Response]", JSON.stringify(response, null, 2));
        const text = (response as any).text || (response as any).content || (typeof response === "string" ? response : "No response content from SDK.");
        
        const segments = text.split(/(\s+)/);
        for (const segment of segments) {
          onChunk(segment);
          await new Promise(r => setTimeout(r, 10));
        }
        return text;
      } else {
        const response = await session.send({ prompt });
        console.log("[SDK Raw Response Sync]", JSON.stringify(response, null, 2));
        return (response as any).text || (response as any).content || (typeof response === "string" ? response : "No response content from SDK.");
      }
    } catch (err: any) {
      console.error("[SDK Error]", err);
      // Clean fallback with more detail for debugging
      const detail = err.message || JSON.stringify(err);
      const failoverText = `目前已透過 Copilot CLI 環境進行串接，但會話初始化遇到預期外的狀況（代碼：${err.code || 'ACP_ERR'}）。\n\n錯誤詳情：${detail}\n\n建議您在終端機執行 \`gh auth status\` 確認狀態，或稍後再試。`;
      if (onChunk) onChunk(failoverText);
      return failoverText;
    }
  }

  // ── Anonymous Preview Case ──
  const previewText = `您目前正處於「預覽模式」。

這是一個基於 2026 Agentic Architecture 的服務模擬。要啟動完整的 ACP 協議並獲得精準的文件優化建議，請在主畫面選擇「Connect Copilot CLI」並完成本地端 GitHub 授權。`;
  
  if (onChunk) {
    const segments = previewText.split(/(\s+)/);
    for (const segment of segments) {
      onChunk(segment);
      await new Promise(r => setTimeout(r, 10));
    }
  }
  return previewText;
}



export function describeCopilotSdkError(err: any) {
  return {
    status: err.status || 502,
    error: 'copilot_sdk_error',
    detail: err.message || String(err),
  };
}
