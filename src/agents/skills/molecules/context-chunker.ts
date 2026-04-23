/**
 * Molecule: ContextChunker ??Smart Token Optimization
 *
 * Prevents Token explosion when long Office documents are passed as context.
 *
 * Strategy:
 *   1. If `text` is below the character threshold ??return as-is (no overhead).
 *   2. Otherwise, split into overlapping chunks.
 *   3. Score each chunk against the query using a lightweight TF-IDF cosine
 *      similarity (no external dependencies).
 *   4. Return the top-K chunks concatenated, staying within the budget.
 *
 * This is a pure in-process operation ??no Python bridge required.
 */

import { logger } from '@shared/logger/index.js';

const TAG = 'ContextChunker';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/** Characters per token (rough approximation for English/CJK mixed content). */
const CHARS_PER_TOKEN = 3;

/** Default budget: ~6 000 tokens of context. */
const DEFAULT_TOKEN_BUDGET = 6_000;
const DEFAULT_CHAR_BUDGET = DEFAULT_TOKEN_BUDGET * CHARS_PER_TOKEN;

/** Below this length, no chunking is applied. */
const CHUNKING_THRESHOLD_CHARS = 4_000;

/** Chunk size in characters (??400 tokens). */
const CHUNK_SIZE = 1_200;

/** Overlap to preserve cross-chunk context. */
const CHUNK_OVERLAP = 200;

/** How many top-scored chunks to include (before budget cap). */
const TOP_K = 8;

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface ChunkResult {
  /** The retrieved context string ready to inject into a prompt. */
  context: string;
  /** Whether chunking was actually applied. */
  chunked: boolean;
  /** Original character count. */
  originalLength: number;
  /** Resulting character count after retrieval. */
  retrievedLength: number;
}

/**
 * Retrieves the most query-relevant portion of `text`, staying within the
 * `charBudget` limit.
 */
export function chunkAndRetrieve(
  text: string,
  query: string,
  charBudget: number = DEFAULT_CHAR_BUDGET,
  traceId?: string,
): ChunkResult {
  const originalLength = text.length;

  if (originalLength <= CHUNKING_THRESHOLD_CHARS) {
    return { context: text, chunked: false, originalLength, retrievedLength: originalLength };
  }

  const chunks = splitChunks(text);
  const queryTokens = tokenize(query);
  const scored = chunks.map((chunk) => ({
    chunk,
    score: cosineSimilarity(queryTokens, tokenize(chunk)),
  }));

  scored.sort((a, b) => b.score - a.score);

  let budget = charBudget;
  const selected: string[] = [];
  for (const { chunk } of scored.slice(0, TOP_K)) {
    if (budget <= 0) break;
    const slice = chunk.slice(0, budget);
    selected.push(slice);
    budget -= slice.length;
  }

  const context = selected.join('\n\n---\n\n');
  const log = traceId ? logger.withTrace(traceId) : logger;
  log.info(TAG, 'Context chunked', {
    originalLength,
    chunks: chunks.length,
    selected: selected.length,
    retrievedLength: context.length,
  });

  return { context, chunked: true, originalLength, retrievedLength: context.length };
}

// ---------------------------------------------------------------------------
// Internal: chunking
// ---------------------------------------------------------------------------

function splitChunks(text: string): string[] {
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    chunks.push(text.slice(start, start + CHUNK_SIZE));
    start += CHUNK_SIZE - CHUNK_OVERLAP;
  }
  return chunks;
}

// ---------------------------------------------------------------------------
// Internal: lightweight TF-IDF cosine similarity
// ---------------------------------------------------------------------------

function tokenize(text: string): Map<string, number> {
  const freq = new Map<string, number>();
  // Split on whitespace + punctuation; lower-case
  const words = text.toLowerCase().match(/[\w\u4e00-\u9fff]+/g) ?? [];
  for (const w of words) {
    freq.set(w, (freq.get(w) ?? 0) + 1);
  }
  return freq;
}

function cosineSimilarity(a: Map<string, number>, b: Map<string, number>): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (const [term, freqA] of a) {
    normA += freqA * freqA;
    const freqB = b.get(term) ?? 0;
    dot += freqA * freqB;
  }
  for (const [, freqB] of b) {
    normB += freqB * freqB;
  }

  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}
