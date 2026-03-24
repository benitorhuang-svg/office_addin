/**
 * Frontend Organism: API Service
 * Orchestrates backend communication using Atoms and Molecules.
 */

import { fetchWithTimeout, findActiveServer } from "../atoms/api-client";
import { STREAM_DECODER } from "../molecules/stream-decoder";
import { CopilotResponse, OfficeContextPayload, ServerConfig } from "../atoms/types";

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
  onChunk?: (chunk: string) => void
): Promise<CopilotResponse> {
  const activePort = await findActiveServer();
  const url = `https://localhost:${activePort}/api/copilot`;

  const payload = {
    prompt,
    officeContext,
    model: model || "gpt-4o",
    presetId,
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

    await STREAM_DECODER.decodeSSE(reader, (chunk) => {
      if (!chunk.startsWith("[ASK_USER]:")) {
        chunks.push(chunk);
      }
      onChunk(chunk);
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
  const port = await findActiveServer();
  const res = await fetch(`https://localhost:${port}/api/config`);
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
    const activePort = await findActiveServer();
    const res = await fetchWithTimeout(`https://localhost:${activePort}/api/acp/validate`, {
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
    const activePort = await findActiveServer();
    const res = await fetchWithTimeout(`https://localhost:${activePort}/api/gemini/validate`, {
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
