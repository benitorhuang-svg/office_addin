/**
 * Util: Context Chunker
 * Dynamic chunking based on character count and content type coefficients.
 */

export interface ChunkOptions {
  maxTokens: number;
  mode?: 'strict' | 'aggressive';
}

/**
 * Calculates a dynamic coefficient to prioritize dense information.
 */
function getDensityCoefficient(text: string): number {
  // eslint-disable-next-line no-control-regex
  const hasSpecialChars = /[^\x00-\x7F]/.test(text); // Contains non-ASCII (e.g. CJK)
  return hasSpecialChars ? 1.5 : 1.0;
}

export function chunkText(text: string, options: ChunkOptions): string[] {
  const coeff = getDensityCoefficient(text);
  // Adjusted limit: account for language density
  const limit = Math.floor(options.maxTokens / coeff);
  
  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += limit) {
    chunks.push(text.substring(i, i + limit));
  }
  return chunks;
}
