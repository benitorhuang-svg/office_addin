/**
 * Frontend Organism: Skill Registry Client
 * Provides access to the skill manifest for client-side discovery.
 */

import { resolveLocalApiUrl } from "@services/molecules/local-server-resolver.js";

export interface SkillManifest {
  version: string;
  domains: Record<string, unknown>;
}

let _cachedManifest: SkillManifest | null = null;

/**
 * Fetches the skill manifest from the server or returns the cached version.
 */
export async function getSkillManifest(): Promise<SkillManifest> {
  if (_cachedManifest) return _cachedManifest;

  const url = await resolveLocalApiUrl("/api/skills");
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch skill manifest: ${response.statusText}`);
  }

  _cachedManifest = (await response.json()) as SkillManifest;
  return _cachedManifest;
}

/**
 * Clears the skill manifest cache.
 */
export function clearManifestCache(): void {
  _cachedManifest = null;
}

/**
 * Checks if a specific skill/action is supported based on the manifest.
 */
export async function isActionSupported(domain: string, skill: string): Promise<boolean> {
  const manifest = await getSkillManifest();
  const domainConfig = manifest.domains[domain] as { skills?: Record<string, unknown> } | undefined;
  return !!domainConfig?.skills?.[skill];
}
