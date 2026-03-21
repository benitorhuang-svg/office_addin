import { CopilotResponse, ServerConfig, OfficeContextPayload } from "../types";

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

async function fetchFromLocalPorts(path: string, init?: RequestInit) {
  const candidatePorts = [4000, 4001];
  const protocol = window.location.protocol === "https:" ? "https:" : "http:";
  let lastErr: unknown = null;

  for (const port of candidatePorts) {
    const url = `${protocol}//localhost:${port}${path}`;
    try {
      return await fetch(url, init);
    } catch (error) {
      console.warn("[copilot] local request failed", {
        port,
        path,
        message: error instanceof Error ? error.message : String(error),
      });
      lastErr = error;
    }
  }

  throw lastErr || new Error(`Failed to contact local service for ${path}`);
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
        "X-Gemini-Key": key
      }
    });
    return await response.json();
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
  geminiToken: string | null = null
): Promise<CopilotResponse> {
  async function doRequest(token: string | null, gKey: string | null) {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;
    if (gKey) headers["X-Gemini-Key"] = gKey;

    const res = await fetchFromLocalPorts("/api/copilot", {
      method: "POST",
      headers,
      body: JSON.stringify(createCoreCopilotRequest(prompt, officeContext, model, presetId)),
    });
    const json = await res.json();

    return { res, json };
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
