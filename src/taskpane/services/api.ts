/**
 * Frontend Organism: API Service
 * Orchestrates backend communication using Atoms and Molecules.
 */

import { fetchWithTimeout, findActiveServer } from "./atoms/api-client";
import { STREAM_DECODER } from "./molecules/stream-decoder";
import { CopilotResponse, OfficeContextPayload, ServerConfig } from "../types";

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
    authProvider: geminiToken ? "gemini_cli" : "copilot_cli",
  };

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (geminiToken) headers["X-Gemini-Key"] = geminiToken;

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
