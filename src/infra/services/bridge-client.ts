/**
 * Skill Bridge Client
 * HTTP client that calls the FastAPI skill bridge instead of spawning Python
 * subprocesses for each request. Eliminates Python cold-start latency.
 *
 * Bridge URL: http://127.0.0.1:8765  (configurable via SKILL_BRIDGE_URL)
 */

import { logger } from '@shared/logger/index.js';

const TAG = 'SkillBridgeClient';

const BRIDGE_URL = process.env['SKILL_BRIDGE_URL'] ?? 'http://127.0.0.1:8765';
const REQUEST_TIMEOUT_MS = 120_000; // 2 minutes ??Python skills can be slow

// ?�?� Types ?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�

export interface ExcelPayload {
  input_path: string;
  output_path: string;
  changes: Record<string, unknown>[];
}

export interface PPTPayload {
  input_path: string;
  output_path: string;
  slides: Record<string, unknown>[];
}

export interface WordPayload {
  input_path: string;
  output_path: string;
  edits: Record<string, unknown>[];
}

export interface VectorSearchPayload {
  query: string;
  documents: string[];
  top_k?: number;
}

export interface VectorSearchResult {
  results: Array<{ document: string; score: number; index: number }>;
}

// ?�?� Core fetch helper ?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�

async function post<T>(path: string, body: unknown): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${BRIDGE_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '(no body)');
      throw new Error(`Skill bridge HTTP ${response.status}: ${text}`);
    }

    return (await response.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
}

// ?�?� Health probe ?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�

export async function probeBridgeHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${BRIDGE_URL}/health`, { signal: AbortSignal.timeout(5_000) });
    return response.ok;
  } catch {
    return false;
  }
}

// ?�?� Skill endpoints ?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�

export async function invokeExcelSkill(payload: ExcelPayload): Promise<unknown> {
  logger.info(TAG, 'Invoking Excel skill via bridge', { output: payload.output_path });
  return post<unknown>('/skills/excel', payload);
}

export async function invokePPTSkill(payload: PPTPayload): Promise<unknown> {
  logger.info(TAG, 'Invoking PPT skill via bridge', { output: payload.output_path });
  return post<unknown>('/skills/ppt', payload);
}

export async function invokeWordSkill(payload: WordPayload): Promise<unknown> {
  logger.info(TAG, 'Invoking Word skill via bridge', { output: payload.output_path });
  return post<unknown>('/skills/word', payload);
}

export async function invokeVectorSearch(payload: VectorSearchPayload): Promise<VectorSearchResult> {
  logger.info(TAG, 'Invoking vector search via bridge', { query: payload.query.slice(0, 80) });
  return post<VectorSearchResult>('/skills/vector-search', payload);
}
