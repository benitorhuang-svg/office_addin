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

import { logger } from "@shared/logger/index.js";

const TAG = "ContextChunker";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/** Characters per token (rough approximation). English is ~3.5-4, Chinese is ~1.5-2. */
// const DEFAULT_CHARS_PER_TOKEN = 3;

/** Default budget in tokens: ~6 000 tokens of context. */
const DEFAULT_TOKEN_BUDGET = 6_000;

/** Below this length, no chunking is applied. */
const CHUNKING_THRESHOLD_CHARS = 4_000;

/** Chunk size in characters (≈400 tokens). */
// const CHUNK_SIZE = 1_200;

/** Overlap to preserve cross-chunk context. */
// const CHUNK_OVERLAP = 200;

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
 * Characters per token (rough approximation). English is ~3.5-4, Chinese is ~1.5-2.
 */
function getCharsPerToken(text: string): number {
  const isChinese = /[\u4e00-\u9fa5]/.test(text);
  return isChinese ? 1.8 : 3.5;
}

/**
 * Dynamically calculates optimal chunk size and overlap based on language.
 * Industrial Grade 5.0 Optimization.
 */
function getOptimalChunkSize(text: string): { size: number; overlap: number } {
  const isChinese = /[\u4e00-\u9fa5]/.test(text);
  if (isChinese) {
    // Chinese characters carry more information per unit
    return { size: 800, overlap: 150 };
  }
  // English/Latin standard
  return { size: 1500, overlap: 300 };
}

/**
 * Retrieves the most query-relevant portion of `text`, staying within the
 * token-based budget.
 */
export function chunkAndRetrieve(
  text: string,
  query: string,
  charBudget?: number,
  traceId?: string
): ChunkResult {
  const originalLength = text.length;

  // Dynamic budget calculation based on content language
  const ratio = getCharsPerToken(text);
  const effectiveCharBudget = charBudget ?? DEFAULT_TOKEN_BUDGET * ratio;

  if (originalLength <= CHUNKING_THRESHOLD_CHARS) {
    return { context: text, chunked: false, originalLength, retrievedLength: originalLength };
  }

  const { size, overlap } = getOptimalChunkSize(text);
  const chunks = splitChunks(text, size, overlap);
  const queryTokens = tokenize(query);

  // Calculate IDF across all chunks for industrial-grade similarity
  const idf = calculateIDF(chunks);

  const scored = chunks.map((chunk) => ({
    chunk,
    score: cosineSimilarity(queryTokens, tokenize(chunk), idf),
  }));

  scored.sort((a, b) => b.score - a.score);

  let budget = effectiveCharBudget;
  const selected: string[] = [];
  for (const { chunk } of scored.slice(0, TOP_K)) {
    if (budget <= 0) break;
    const slice = chunk.slice(0, budget);
    selected.push(slice);
    budget -= slice.length;
  }

  const context = selected.join("\n\n---\n\n");
  const log = traceId ? logger.withTrace(traceId) : logger;
  log.info(TAG, "Context chunked with IDF & Dynamic Sizing", {
    originalLength,
    chunks: chunks.length,
    selected: selected.length,
    retrievedLength: context.length,
    chunkSize: size,
  });

  return { context, chunked: true, originalLength, retrievedLength: context.length };
}

// ---------------------------------------------------------------------------
// Internal: chunking
// ---------------------------------------------------------------------------

function splitChunks(text: string, size: number, overlap: number): string[] {
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    chunks.push(text.slice(start, start + size));
    start += size - overlap;
    if (start >= text.length) break;
  }
  return chunks;
}

// ---------------------------------------------------------------------------
// Internal: lightweight TF-IDF cosine similarity
// ---------------------------------------------------------------------------

const STOPWORDS = new Set([
  // English
  "the",
  "a",
  "an",
  "is",
  "are",
  "was",
  "were",
  "in",
  "on",
  "at",
  "to",
  "for",
  "of",
  "and",
  "or",
  "but",
  "it",
  "that",
  "this",
  // Chinese
  "的",
  "是",
  "在",
  "了",
  "和",
  "與",
  "或",
  "就",
  "也",
  "都",
  "而",
  "及",
  "與",
  "著",
]);

function tokenize(text: string): Map<string, number> {
  const freq = new Map<string, number>();
  // Split on whitespace + punctuation; lower-case
  const words = text.toLowerCase().match(/[\w\u4e00-\u9fff]+/g) ?? [];
  for (const w of words) {
    if (STOPWORDS.has(w)) continue;
    freq.set(w, (freq.get(w) ?? 0) + 1);
  }
  return freq;
}

/**
 * Calculates Inverse Document Frequency (IDF) for all terms in chunks.
 */
function calculateIDF(chunks: string[]): Map<string, number> {
  const idf = new Map<string, number>();
  const N = chunks.length;

  for (const chunk of chunks) {
    const tokens = new Set(tokenize(chunk).keys());
    for (const token of tokens) {
      idf.set(token, (idf.get(token) ?? 0) + 1);
    }
  }

  for (const [token, count] of idf) {
    idf.set(token, Math.log((N + 1) / (count + 0.5)));
  }

  return idf;
}

function cosineSimilarity(
  a: Map<string, number>,
  b: Map<string, number>,
  idf?: Map<string, number>
): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (const [term, freqA] of a) {
    const weight = idf?.get(term) ?? 1;
    const valA = freqA * weight;
    normA += valA * valA;

    const freqB = b.get(term) ?? 0;
    const valB = freqB * weight;
    dot += valA * valB;
  }
  for (const [term, freqB] of b) {
    const weight = idf?.get(term) ?? 1;
    const valB = freqB * weight;
    normB += valB * valB;
  }

  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}
