import { AssistantMessageEvent } from "@github/copilot-sdk";

/** 
 * Atom: Extract text from AssistantMessageEvent 
 */
export function extractResponseText(event: AssistantMessageEvent | undefined): string {
  if (!event) return '';
  if (event.data?.content) return event.data.content;
  return '';
}

/**
 * Atom: Simulate chunks from a completed response string (for fallback cases)
 */
export async function emitChunks(text: string, onChunk: (chunk: string) => void): Promise<void> {
  const segments = text.split(/([\s,.!?;]+)/);
  for (const segment of segments) {
    if (segment) onChunk(segment);
    await new Promise(r => setTimeout(r, 10));
  }
}

/**
 * Atom: Standardize Copilot SDK error formatting 
 */
export function describeCopilotSdkError(err: unknown) {
  const e = err as Record<string, unknown>;
  return {
    status: (e?.status as number) || 502,
    error: 'copilot_sdk_error',
    detail: err instanceof Error ? err.message : String(err),
  };
}
