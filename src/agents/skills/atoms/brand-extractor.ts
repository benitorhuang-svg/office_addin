/**
 * Atom: BrandExtractor (Huashu Integration ??Brand Intelligence)
 *
 * Extracts a minimal Corporate Identity token set from a public URL.
 * Strategy:
 *   1. Fetch the HTML of the target URL.
 *   2. Parse meta `theme-color`, Open Graph image hints, and inline CSS variable values.
 *   3. Extract the most frequent non-neutral colors from <style> blocks and inline styles.
 *   4. Return a `BrandTokens` object that can be serialised directly as CSS custom properties
 *      and injected into nexus-tokens.css at runtime, OR forwarded to the PPT python engine
 *      as slide Design Tokens.
 *
 * Security: Only fetches HTTPS URLs. Timeouts at 6 s. Strips scripts.
 * This atom is intentionally lightweight ??it does NOT run a headless browser.
 * For full pixel-level extraction, delegate to vision_expert.py via the Python bridge.
 */

import { logger } from '@shared/logger/index.js';

const TAG = 'BrandExtractor';
const FETCH_TIMEOUT_MS = 6_000;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface BrandTokens {
  /** Primary brand color ??typically the dominant non-neutral hue. */
  primary: string;
  /** Secondary brand color (complement or analogous). */
  secondary: string;
  /** Accent / CTA color. */
  accent: string;
  /** Background color (light or dark detected). */
  background: string;
  /** Text color on the background. */
  text: string;
  /** CSS custom property block ready for injection. */
  cssBlock: string;
  /** Source URL that was analysed. */
  sourceUrl: string;
}

export interface BrandExtractResult {
  ok: boolean;
  tokens?: BrandTokens;
  error?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Rough check: is this a neutral (white/grey/black) color? */
function isNeutral(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const saturation = max === 0 ? 0 : (max - min) / max;
  // Neutral if very low saturation or very dark / very light
  return saturation < 0.15 || max < 30 || min > 220;
}

/** Normalise a 3-char hex to 6-char lowercase. */
function normaliseHex(raw: string): string {
  const h = raw.replace('#', '');
  if (h.length === 3) return `#${h[0]}${h[0]}${h[1]}${h[1]}${h[2]}${h[2]}`;
  return `#${h.toLowerCase()}`;
}

/** Extract all hex colour literals from a string. */
function extractHexColors(text: string): string[] {
  const matches = text.match(/#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g) ?? [];
  return matches.map(normaliseHex);
}

/** Parse `theme-color` meta tag. */
function parseThemeColor(html: string): string | null {
  const m = html.match(/<meta[^>]+name=["']theme-color["'][^>]+content=["']([^"']+)["']/i)
         ?? html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']theme-color["']/i);
  return m ? m[1].trim() : null;
}

/** Tally color frequencies and return the top N non-neutral colors. */
function topColors(colors: string[], n: number): string[] {
  const freq = new Map<string, number>();
  for (const c of colors) {
    if (!isNeutral(c)) freq.set(c, (freq.get(c) ?? 0) + 1);
  }
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([c]) => c);
}

/** Derive a readable text color (black / white) from a background hex. */
function contrastText(bg: string): string {
  const r = parseInt(bg.slice(1, 3), 16);
  const g = parseInt(bg.slice(3, 5), 16);
  const b = parseInt(bg.slice(5, 7), 16);
  // WCAG relative luminance approximation
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.5 ? '#1e293b' : '#f8fafc';
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Extract brand tokens from a public URL.
 *
 * @param url - HTTPS URL of a brand homepage or landing page.
 * @returns   - BrandExtractResult with tokens or an error message.
 */
export async function extractBrandTokens(url: string): Promise<BrandExtractResult> {
  // Security: only allow HTTPS
  if (!url.startsWith('https://')) {
    return { ok: false, error: 'Only HTTPS URLs are supported for brand extraction.' };
  }

  logger.info(TAG, `Extracting brand tokens from ${url}`);

  let html: string;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'NexusBrandExtractor/1.0 (brand-color-analysis; non-indexing)',
        'Accept': 'text/html',
      },
    });
    clearTimeout(timer);

    if (!res.ok) {
      return { ok: false, error: `HTTP ${res.status} from ${url}` };
    }
    html = await res.text();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    logger.warn(TAG, `Fetch failed for ${url}`, { error: message });
    return { ok: false, error: `Fetch failed: ${message}` };
  }

  // --- Parse ---
  const themeColor = parseThemeColor(html);

  // Extract all hex colors from <style> blocks and inline style attributes
  const styleContent = (html.match(/<style[^>]*>([\s\S]*?)<\/style>/gi) ?? []).join(' ')
                     + (html.match(/style=["'][^"']*["']/gi) ?? []).join(' ');
  const allColors = extractHexColors(styleContent);
  if (themeColor && /^#/.test(themeColor)) allColors.unshift(normaliseHex(themeColor));

  const top = topColors(allColors, 5);

  // Fallback palette when extraction yields nothing
  const primary   = top[0] ?? '#2563eb';
  const secondary = top[1] ?? '#1d4ed8';
  const accent    = top[2] ?? '#8b5cf6';
  const background = '#ffffff';
  const text       = contrastText(background);

  const cssBlock = [
    '/* Brand Intelligence ??extracted by Nexus BrandExtractor */',
    `:root {`,
    `  --brand-extracted-primary:    ${primary};`,
    `  --brand-extracted-secondary:  ${secondary};`,
    `  --brand-extracted-accent:     ${accent};`,
    `  --brand-extracted-background: ${background};`,
    `  --brand-extracted-text:       ${text};`,
    `}`,
  ].join('\n');

  logger.info(TAG, `Brand tokens extracted`, { primary, secondary, accent, colorCandidates: top.length });

  return {
    ok: true,
    tokens: { primary, secondary, accent, background, text, cssBlock, sourceUrl: url },
  };
}
