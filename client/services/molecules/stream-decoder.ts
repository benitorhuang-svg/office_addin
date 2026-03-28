/**
 * Frontend Molecule: Stream Decoder
 * Responsibilities: Handling SSE/Chunked responses and JSON extraction.
 */

export const STREAM_DECODER = {
   /**
   * Decoder: SSE (Server Sent Events)
   * Formats: `data: {"text": "..."}`
   */
  async decodeSSE(reader: ReadableStreamDefaultReader<Uint8Array>, onText: (text: string) => void | Promise<void>) {
    const decoder = new TextDecoder();
    let buffer = "";

    while (reader) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const cleaned = line.trim();
        if (!cleaned || cleaned === "data: [DONE]") continue;
        if (cleaned.startsWith("data: ")) {
          let json;
          try {
            json = JSON.parse(cleaned.substring(6));
          } catch (e) {
            console.warn("[Stream Decoder] JSON parse error", e);
            continue;
          }
          
          if (json.text !== undefined) {
             // CRUCIAL: Await the rendering if it's a promise
             const result = onText(json.text);
             if (result instanceof Promise) await result;
          }
          
          if (json.error) {
            throw new Error(json.detail || json.error);
          }
        }
      }
    }

    // Process any remaining buffered data after stream ends
    if (buffer.trim()) {
      const remaining = buffer.trim();
      if (remaining.startsWith("data: ") && remaining !== "data: [DONE]") {
        try {
          const json = JSON.parse(remaining.substring(6));
          if (json.text) {
             const result = onText(json.text);
             if (result instanceof Promise) await result;
          }
          if (json.error) throw new Error(json.detail || json.error);
        } catch (e) {
          console.warn("[Stream Decoder] Final buffer parse error", e);
        }
      }
    }
  },
};
