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
  if (cachedOrigin && cachedOrigin.expiresAt > Date.now()) {
    return [
      cachedOrigin.origin,
      ...API_CLIENT_CONFIG.LOCAL_PROTOCOLS.flatMap((protocol) =>
        API_CLIENT_CONFIG.LOCAL_PORTS.map((port) => `${protocol}://localhost:${port}`)
      ).filter((origin) => origin !== cachedOrigin.origin),
    ];
  }

  return API_CLIENT_CONFIG.LOCAL_PROTOCOLS.flatMap((protocol) =>
    API_CLIENT_CONFIG.LOCAL_PORTS.map((port) => `${protocol}://localhost:${port}`)
  );
}

async function probeOrigin(origin: string): Promise<boolean> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CLIENT_CONFIG.PROBE_TIMEOUT_MS);

  try {
    const response = await fetch(`${origin}/api/config`, {
      method: "HEAD",
      signal: controller.signal,
    });
    return response.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timeoutId);
  }
}

export function invalidateLocalServerOriginCache(): void {
  cachedOrigin = null;
}

export async function resolveLocalServerOrigin(): Promise<string> {
  if (cachedOrigin && cachedOrigin.expiresAt > Date.now()) {
    return cachedOrigin.origin;
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