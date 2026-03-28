/**
 * Frontend Atom: API Client
 * Responsibilities: Basic fetch, timeout, and SSE data management.
 * Prioritized 4000 for server discovery.
 */

export const API_CLIENT_CONFIG = {
  TIMEOUT_MS: 300000,
  // 4000 is the dedicated backend, check it first to avoid webpack proxy collisions.
  LOCAL_PORTS: [4000, 3001, 3000],
  LOCAL_PROTOCOLS: ["https", "http"],
  PROBE_TIMEOUT_MS: 1500,
  DISCOVERY_CACHE_TTL_MS: 30000,
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
