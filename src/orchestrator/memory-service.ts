import { ChromaAdapter } from "@adapters/vector-db/chroma-adapter.js";
import crypto from "crypto";

/**
 * ?��?記憶?��? (Shared Memory Service)
 * �?AI ?��?中�??��?Agent ?��??�檢索長?��???
 */
export class MemoryService {
  private adapter: ChromaAdapter;

  constructor(adapter: ChromaAdapter) {
    this.adapter = adapter;
  }

  /**
   * 存入一段�???
   * @param text 要�?住�??�容
   * @param embedding ?�容?��???(??Gemini ?��?)
   * @param source 來�? (例�? "expert-word", "user")
   */
  async save(
    text: string,
    embedding: number[],
    source: string,
    extraMetadata: Record<string, unknown> = {}
  ) {
    const id = crypto
      .createHash("sha256")
      .update(text + Date.now())
      .digest("hex");
    const metadata = {
      source,
      timestamp: new Date().toISOString(),
      ...extraMetadata,
    };

    await this.adapter.addMemory(id, embedding, text, metadata);
    return id;
  }

  /**
   * 檢索?��?記憶 (RAG)
   * @param queryEmbedding ?�詢?��?
   * @param limit ?�傳筆數
   */
  async recall(queryEmbedding: number[], limit: number = 3) {
    const results = await this.adapter.queryMemory(queryEmbedding, limit);

    if (!results || !results.documents || results.documents.length === 0) {
      return [];
    }

    const docs = results.documents[0];
    if (!docs) return [];

    return docs.map((doc, i) => ({
      text: doc,
      metadata: results.metadatas?.[0]?.[i],
      distance: results.distances?.[0]?.[i],
    }));
  }
}
