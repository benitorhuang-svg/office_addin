/**
 * Skill Bridge Client
 * HTTP client that calls the FastAPI skill bridge instead of spawning Python
 * subprocesses for each request. Eliminates Python cold-start latency.
 *
 * Bridge URL: http://127.0.0.1:8765  (configurable via SKILL_BRIDGE_URL)
 */

import { logger } from "@shared/logger/index.js";

const TAG = "SkillBridgeClient";

const BRIDGE_URL = process.env["SKILL_BRIDGE_URL"] ?? "http://127.0.0.1:8765";
const REQUEST_TIMEOUT_MS = 120_000; // 2 minutes ??Python skills can be slow

// ?�?� Types ?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�

export interface ExcelPayload {
  /** Optional path to an existing .xlsx/.xlsm file to preserve and modify. */
  input_path?: string;
  /** Required path where the processed spreadsheet will be saved. */
  output_path: string;
  /** Array of spreadsheet operations (set_value, add_formula, etc.) */
  changes: Record<string, unknown>[];
  /** Environment context from Office host (activeSheet, theme, etc.) */
  office_context?: Record<string, unknown>;
}

export interface PPTPayload {
  /** Optional path to an existing .pptx template. */
  input_path?: string;
  /** Required path where the processed presentation will be saved. */
  output_path: string;
  /** Array of slide operations (add_slide, add_shape, etc.) */
  slides: Record<string, unknown>[];
  /** Environment context from Office host (themeColors, layout info). */
  office_context?: Record<string, unknown>;
}

export interface WordPayload {
  /** Optional path to an existing .docx document to preserve template and styles. */
  input_path?: string;
  /** Required path where the processed document will be saved. */
  output_path: string;
  /** Array of semantic document edits (insert_paragraph, replace_section, etc.) */
  edits: Record<string, unknown>[];
  /** Environment context from Office host (glossary, outline, protectedRanges). */
  office_context?: Record<string, unknown>;
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
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!response.ok) {
      let errorDetail = "(no body)";
      try {
        const errorJson = await response.json();
        errorDetail = JSON.stringify(errorJson);
      } catch {
        errorDetail = await response.text().catch(() => "(no body)");
      }
      throw new Error(`Skill bridge HTTP ${response.status}: ${errorDetail}`);
    }

    return (await response.json()) as T;
  } catch (err) {
    const error = err as Error;
    if (error.name === "AbortError") {
      throw new Error(`Skill bridge request timed out after ${REQUEST_TIMEOUT_MS}ms`);
    }
    throw err;
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
  logger.info(TAG, "Invoking Excel skill via bridge", { output: payload.output_path });
  return post<unknown>("/skills/excel", payload);
}

export async function invokePPTSkill(payload: PPTPayload): Promise<unknown> {
  logger.info(TAG, "Invoking PPT skill via bridge", { output: payload.output_path });
  return post<unknown>("/skills/ppt", payload);
}

export async function invokeWordSkill(payload: WordPayload): Promise<unknown> {
  logger.info(TAG, "Invoking Word skill via bridge", { output: payload.output_path });
  return post<unknown>("/skills/word", payload);
}

export async function invokeVectorSearch(
  payload: VectorSearchPayload
): Promise<VectorSearchResult> {
  logger.info(TAG, "Invoking vector search via bridge", { query: payload.query.slice(0, 80) });
  return post<VectorSearchResult>("/skills/vector-search", payload);
}
