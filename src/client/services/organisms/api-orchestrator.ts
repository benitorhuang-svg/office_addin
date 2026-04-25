/**
 * Frontend Organism: API Service
 * Orchestrates backend communication using Atoms and Molecules.
 */

import { fetchWithTimeout } from "@services/atoms/api-client.js";
import { resolveLocalApiUrl } from "@services/molecules/local-server-resolver.js";
import { STREAM_DECODER } from "@services/molecules/stream-decoder.js";
import { CopilotResponse, OfficeContextPayload, ServerConfig } from "@services/atoms/types.js";

/**
 * Organism: Sends prompt to Copilot via local server.
 * Orchestrates the flow: Active Port Discovery -> Fetch -> SSE Decoding -> Completion
 */
export async function sendToCopilot(
  prompt: string,
  token: string | null,
  officeContext: OfficeContextPayload,
  model: string,
  presetId: string,
  authProvider: string,
  geminiToken: string | null,
  systemPrompt?: string,
  onChunk?: (chunk: string) => void
): Promise<CopilotResponse> {
  const url = await resolveLocalApiUrl("/api/copilot");

  const payload = {
    prompt,
    officeContext,
    model: model || "gpt-4o",
    presetId,
    systemPrompt,
    stream: !!onChunk,
    authProvider: authProvider || (geminiToken ? "gemini_api" : "copilot_cli"),
  };

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (authProvider === "gemini_api" && geminiToken) {
    headers["X-Gemini-Key"] = geminiToken;
  }

  const response = await fetchWithTimeout(url, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: "Network error" }));
    throw new Error(err.detail || "Server responded with error");
  }

  // Handle SSE Streaming using Molecule
  if (!!onChunk && response.body) {
    const reader = response.body.getReader();
    const chunks: string[] = [];

    await STREAM_DECODER.decodeSSE(reader, async (chunk) => {
      if (!chunk.startsWith("[ASK_USER]:")) {
        chunks.push(chunk);
      }
      await onChunk(chunk);
    });

    return { text: chunks.join(""), actions: [], model: model };
  }

  // Standard JSON response
  return (await response.json()) as CopilotResponse;
}

/**
 * Organism: Fetches server configuration (model list, etc.)
 */
export async function getConfig(): Promise<ServerConfig> {
  const url = await resolveLocalApiUrl("/api/config");
  const res = await fetch(url);
  return (await res.json()) as ServerConfig;
}

/**
 * Validates any token (gemini, copilot, azure) natively over ACP interface.
 */
export async function validateACPToken(
  method: "gemini" | "copilot" | "azure",
  token: string,
  endpoint?: string,
  deployment?: string
): Promise<{ ok: boolean; message?: string }> {
  try {
    const url = await resolveLocalApiUrl("/api/acp/validate");
    const res = await fetchWithTimeout(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ method, token, endpoint, deployment }),
    });

    if (res.ok) return { ok: true };
    const errObj = await res.json().catch(() => ({}));
    return { ok: false, message: errObj.detail || `Invalid ${method} token or ACP failure.` };
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }
}

export async function validateGeminiApiKey(
  token: string
): Promise<{ ok: boolean; message?: string }> {
  try {
    const url = await resolveLocalApiUrl("/api/gemini/validate");
    const res = await fetchWithTimeout(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apiKey: token }),
    });

    if (res.ok) return { ok: true };
    const errObj = await res.json().catch(() => ({}));
    return { ok: false, message: errObj.detail || "Invalid Gemini API key." };
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }
}
export interface ServerHealth {
  status: string;
  timestamp: string;
  clients: Record<string, unknown>;
  uptime: number;
}

/**
 * Organism: Fetches server health (uptime, clients, status).
 */
export async function getHealth(): Promise<ServerHealth> {
  const url = await resolveLocalApiUrl("/api/health");
  const res = await fetch(url);
  return (await res.json()) as ServerHealth;
}

/**
 * Organism: Triggers an emergency SDK patching on the server.
 */
export async function patchSystem(): Promise<{ status: number; detail: string }> {
  try {
    const url = await resolveLocalApiUrl("/api/system/patch");
    const res = await fetch(url, { method: "POST" });
    return (await res.json()) as { status: number; detail: string };
  } catch (e) {
    throw new Error((e as Error).message);
  }
}

/**
 * Organism: Triggers an AI Gateway warmup.
 */
export async function warmupSystem(): Promise<{ status: number; detail: string }> {
  try {
    const url = await resolveLocalApiUrl("/api/system/warmup");
    const res = await fetch(url);
    return (await res.json()) as { status: number; detail: string };
  } catch (e) {
    throw new Error((e as Error).message);
  }
}
