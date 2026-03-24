/**
 * Frontend Atom: API Client
 * Responsibilities: Basic fetch, timeout, and SSE data management.
 */

export const API_CLIENT_CONFIG = {
  // Synchronize with server-side 300s timeout
  TIMEOUT_MS: 300000,
  // Prefer direct backend first. Going through webpack proxy can buffer SSE.
  LOCAL_PORTS: [4000, 3000],
};

export async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeout: number = API_CLIENT_CONFIG.TIMEOUT_MS
) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

/**
 * Probes the local backend ports to find the active server.
 */
export async function findActiveServer(): Promise<number> {
  for (const port of API_CLIENT_CONFIG.LOCAL_PORTS) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 1500); // 1.5s timeout for probing
    try {
      const res = await fetch(`https://localhost:${port}/api/config`, { 
        method: "HEAD",
        signal: controller.signal
      });
      clearTimeout(id);
      if (res.ok) return port;
    } catch {
      clearTimeout(id);
      continue;
    }
  }
  return 4000; // Default fallback
}
