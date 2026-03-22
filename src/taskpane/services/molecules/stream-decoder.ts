/**
 * Frontend Molecule: Stream Decoder
 * Responsibilities: Handling SSE/Chunked responses and JSON extraction.
 */

export const STREAM_DECODER = {
  /**
   * Decoder: SSE (Server Sent Events)
   * Formats: `data: {"text": "..."}`
   */
  async decodeSSE(reader: ReadableStreamDefaultReader<Uint8Array>, onText: (text: string) => void) {
    const decoder = new TextDecoder();
    let buffer = '';

    while (reader) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const cleaned = line.trim();
        if (!cleaned || cleaned === 'data: [DONE]') continue;
        if (cleaned.startsWith('data: ')) {
          try {
            const json = JSON.parse(cleaned.substring(6));
            if (json.text) onText(json.text);
            if (json.error) throw new Error(json.detail || json.error);
          } catch (_e) {
            return null;
          }
        }
      }
    }
  }
};
