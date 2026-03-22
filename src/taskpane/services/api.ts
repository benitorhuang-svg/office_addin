/* eslint-disable no-undef, preserve-caught-error */
import { CopilotResponse, ServerConfig, OfficeContextPayload } from "../types";
import { getAuthProvider } from "./storage";

function trimAndCollapseWhitespace(value: string) {
  return String(value || "")
    .trim()
    .replace(/[\t ]+/g, " ")
    .replace(/\n{3,}/g, "\n\n");
}

function filterOfficeContext(officeContext: OfficeContextPayload) {
  const selectionText = trimAndCollapseWhitespace(
    officeContext && officeContext.selectionText ? officeContext.selectionText : ""
  );
  const documentText = trimAndCollapseWhitespace(
    officeContext && officeContext.documentText ? officeContext.documentText : ""
  );
  const host = officeContext.host || "Word";

  return {
    host,
    selectionText: selectionText.slice(0, 1500),
    documentText: documentText.slice(0, 1000), // Both are now provided
  };
}

function createCoreCopilotRequest(
  prompt: string,
  officeContext: OfficeContextPayload,
  model: string,
  presetId: string
) {
  return {
    prompt: trimAndCollapseWhitespace(prompt),
    wordContext: filterOfficeContext(officeContext),
    model,
    presetId,
  };
}

export async function fetchFromLocalPorts(path: string, init?: RequestInit) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

  try {
    const response = await fetch(path, {
      ...init,
      signal: controller.signal,
    });
    return response;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`請求超時：伺服器未能在 60 秒內響應 (${error.message})`);
    }
    console.warn("[copilot] request failed", {
      path,
      message: error instanceof Error ? error.message : String(error),
    });
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function getServerConfig() {
  const response = await fetchFromLocalPorts("/api/config", { method: "GET" });
  if (!response.ok) {
    throw new Error(`Failed to read local config: HTTP ${response.status}`);
  }
  return response.json() as Promise<ServerConfig>;
}

export async function validateGeminiKey(key: string): Promise<{ ok: boolean; message?: string }> {
  try {
    const response = await fetchFromLocalPorts("/api/validate-gemini", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Gemini-Key": key,
      },
    });
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await response
        .json()
        .catch(() => ({ ok: false, message: "Server returned malformed JSON" }));
    } else {
      const text = await response.text().catch(() => "Unknown server error");
      return { ok: false, message: text };
    }
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Network error" };
  }
}

export async function sendToCopilot(
  prompt: string,
  githubToken: string | null,
  officeContext: OfficeContextPayload,
  model: string,
  presetId: string,
  geminiToken: string | null = null,
  onChunk?: (chunk: string) => void
): Promise<CopilotResponse> {
  const isStreaming = Boolean(onChunk);

  async function doRequest(token: string | null, gKey: string | null) {
    const { getStoredAzureConfig } = await import("./storage");
    const azure = getStoredAzureConfig();

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;
    if (gKey) headers["X-Gemini-Key"] = gKey;
    if (azure.key) headers["X-Azure-Key"] = azure.key;
    if (azure.endpoint) headers["X-Azure-Endpoint"] = azure.endpoint;
    if (azure.deployment) headers["X-Azure-Deployment"] = azure.deployment;

    const body = {
      ...createCoreCopilotRequest(prompt, officeContext, model, presetId),
      stream: isStreaming,
      authProvider: getAuthProvider(),
    };

    const res = await fetchFromLocalPorts("/api/copilot", {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (isStreaming && res.ok) {
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = "";
      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const dataStr = line.substring(6).trim();
            if (dataStr === "[DONE]") break;
            try {
              const data = JSON.parse(dataStr);
              if (data.text) {
                fullText += data.text;
                onChunk!(data.text);
              }
            } catch {
              /* ignore */
            }
          }
        }
      }
      return { res, json: { text: fullText } };
    }

    let json: { text?: string; error?: string } & Record<string, unknown>;
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      json = await res.json().catch(() => ({}));
    } else {
      const text = await res.text().catch(() => "Unknown error");
      json = { error: text };
    }
    return { res, json: json as CopilotResponse };
  }

  let { res, json } = await doRequest(githubToken, geminiToken);

  if (!res.ok && res.status === 401 && githubToken) {
    ({ res, json } = await doRequest(null, geminiToken));
  }

  if (!res.ok) {
    const detail = json && typeof json.detail === "string" ? json.detail : "";
    const error = json && typeof json.error === "string" ? json.error : `HTTP ${res.status}`;
    throw new Error(detail ? `${error}: ${detail}` : error);
  }

  return json;
}
