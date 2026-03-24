/** 
 * Atom: Extract text from AssistantMessageEvent 
 */
interface CopilotEventLike {
  result?: { content?: string };
  data?: { content?: string; text?: string };
  content?: string;
}

export function extractResponseText(event: Record<string, unknown>): string {
  if (!event) return '';
  // Handle various Copilot SDK response shapes (direct result or data-wrapped)
  const e = event as unknown as CopilotEventLike;
  const content = e.result?.content || e.data?.content || e.data?.text || e.content;
  if (content) return content;
  
  // Fallback for raw string or other shapes
  return typeof event === 'string' ? event : '';
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
