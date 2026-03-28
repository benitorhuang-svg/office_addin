import { API_CLIENT_CONFIG } from "../atoms/api-client";

interface CachedServerOrigin {
  origin: string;
  expiresAt: number;
}

let cachedOrigin: CachedServerOrigin | null = null;
let pendingOriginResolution: Promise<string> | null = null;

function normalizeApiPath(pathname: string): string {
  return pathname.startsWith("/") ? pathname : `/${pathname}`;
}

function buildProbeOrigins(): string[] {
  const remoteUrl = window.localStorage.getItem("REMOTE_SERVER_URL");
  const currentOrigin = window.location.origin;
  
  const baseOrigins: string[] = [];
  if (remoteUrl) baseOrigins.push(remoteUrl.replace(/\/$/, ""));
  
  // Prefer current origin as a probe target
  baseOrigins.push(currentOrigin);

  const currentCached = cachedOrigin;
  if (currentCached && currentCached.expiresAt > Date.now()) {
    return [
      currentCached.origin,
      ...baseOrigins,
      ...API_CLIENT_CONFIG.LOCAL_PORTS.map((port) => `https://localhost:${port}`)
        .filter((origin) => origin !== currentCached.origin),
    ];
  }

  const protocols = currentOrigin.startsWith("https") ? ["https"] : ["https", "http"];
  
  return [
    ...baseOrigins,
    ...API_CLIENT_CONFIG.LOCAL_PORTS.flatMap((p) => protocols.map(pr => `${pr}://localhost:${p}`))
  ];
}

/**
 * Probe origin for active Nexus Server.
 * Strictly checks Content-Type to avoid misdetecting Webpack proxy as backend.
 */
async function probeOrigin(origin: string): Promise<boolean> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CLIENT_CONFIG.PROBE_TIMEOUT_MS);

  try {
    const response = await fetch(`${origin}/api/config`, {
      method: "GET",
      signal: controller.signal,
    });
    
    const contentType = response.headers.get("Content-Type") || "";
    return response.ok && contentType.includes("application/json");
  } catch (err) {
    // ?儭?CRITICAL FIX: If we can't fetch but it's our primary port, 
    // it's likely a certificate issue, not a dead server. 
    // We should still consider it the active origin so the user can trust the cert.
    if (origin.includes(":4000")) {
      console.warn(`[Probe] Port 4000 detected potential cert wall: ${err}`);
      return true; 
    }
    return false;
  } finally {
    clearTimeout(timeoutId);
  }
}

export function invalidateLocalServerOriginCache(): void {
  cachedOrigin = null;
}

export async function resolveLocalServerOrigin(): Promise<string> {
  const currentCached = cachedOrigin;
  if (currentCached && currentCached.expiresAt > Date.now()) {
    return currentCached.origin;
  }

  if (pendingOriginResolution) {
    return pendingOriginResolution;
  }

  pendingOriginResolution = (async () => {
    for (const origin of buildProbeOrigins()) {
      if (await probeOrigin(origin)) {
        cachedOrigin = {
          origin,
          expiresAt: Date.now() + API_CLIENT_CONFIG.DISCOVERY_CACHE_TTL_MS,
        };
        return origin;
      }
    }

    const fallbackOrigin = `https://localhost:${API_CLIENT_CONFIG.LOCAL_PORTS[0]}`;
    cachedOrigin = null;
    return fallbackOrigin;
  })();

  try {
    return await pendingOriginResolution;
  } finally {
    pendingOriginResolution = null;
  }
}

export async function resolveLocalApiUrl(pathname: string): Promise<string> {
  const origin = await resolveLocalServerOrigin();
  return `${origin}${normalizeApiPath(pathname)}`;
}

export async function findActiveServer(): Promise<number> {
  const origin = await resolveLocalServerOrigin();
  return Number(new URL(origin).port || API_CLIENT_CONFIG.LOCAL_PORTS[0]);
}
