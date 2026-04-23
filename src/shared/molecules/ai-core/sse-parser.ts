/**
 * Molecule: SSE Parser
 * Decodes a ReadableStream of bytes into a stream of JSON data strings.
 */
export const SSE_PARSER = {
  async *parse(reader: ReadableStreamDefaultReader<Uint8Array>): AsyncGenerator<string> {
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
          yield cleaned.substring(6);
        }
      }
    }
  }
};
