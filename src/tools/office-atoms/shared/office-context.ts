import type { OfficeContext } from "@shared/atoms/ai-core/types.js";

export interface NormalizedOfficeContext {
  host: string;
  selectedText: string;
  documentText: string;
  selectionPreview: string;
  documentPreview: string;
  hasSelection: boolean;
  hasDocument: boolean;
}

type FlexibleOfficeContext = Partial<OfficeContext> & Record<string, unknown>;

function pickString(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }

  return "";
}

function normalizeHost(host: string): string {
  if (/powerpoint|ppt/i.test(host)) {
    return "PowerPoint";
  }

  if (/excel|spreadsheet/i.test(host)) {
    return "Excel";
  }

  if (/word|document/i.test(host)) {
    return "Word";
  }

  return host || "Word";
}

function truncate(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 3)}...`;
}

export function mergeOfficeContext(
  baseContext?: OfficeContext,
  overrideContext?: Partial<OfficeContext>,
): NormalizedOfficeContext {
  const merged = {
    ...(baseContext ?? {}),
    ...(overrideContext ?? {}),
  } as FlexibleOfficeContext;

  const host = normalizeHost(pickString(merged.host) || "Word");
  const selectedText = pickString(
    merged.selectedText,
    merged.selectionText,
    merged.selection,
  );
  const documentText = pickString(
    merged.documentText,
    merged.fullBody,
    merged.surroundingContent,
  );

  return {
    host,
    selectedText,
    documentText,
    selectionPreview: truncate(selectedText, 400),
    documentPreview: truncate(documentText, 1200),
    hasSelection: selectedText.length > 0,
    hasDocument: documentText.length > 0,
  };
}

export function isHostCompatible(expectedHost: string, actualHost: string): boolean {
  const normalizedExpected = normalizeHost(expectedHost).toLowerCase();
  const normalizedActual = normalizeHost(actualHost).toLowerCase();
  return normalizedExpected === normalizedActual;
}

