import { ChromaClient, Collection } from "chromadb";

/**
 * ChromaDB 適配器 (Hexagonal Adapter)
 * 負責與底層向量資料庫通訊
 */
export class ChromaAdapter {
  private client: ChromaClient;
  private collection: Collection | null = null;

  constructor(path: string = "http://localhost:8000") {
    this.client = new ChromaClient({ path });
  }

  /**
   * 初始化 Collection
   * @param name Collection 名稱 (例如 "agent_memory")
   */
  async initCollection(name: string = "nexus_memory") {
    try {
      this.collection = await this.client.getOrCreateCollection({
        name,
        metadata: { "description": "Nexus Multi-Agent Memory Space" }
      });
      return this.collection;
    } catch (error) {
      console.error("Failed to initialize Chroma collection:", error);
      throw error;
    }
  }

  /**
   * 儲存記憶 (向量與元數據)
   */
  async addMemory(id: string, vector: number[], document: string, metadata: Record<string, unknown> = {}) {
    if (!this.collection) await this.initCollection();
    
    await this.collection!.add({
      ids: [id],
      embeddings: [vector],
      metadatas: [metadata as Record<string, string | number | boolean>],
      documents: [document]
    });
  }

  /**
   * 語義搜索
   */
  async queryMemory(vector: number[], limit: number = 3) {
    if (!this.collection) await this.initCollection();

    const results = await this.collection!.query({
      queryEmbeddings: [vector],
      nResults: limit
    });
    return results;
  }

  /**
   * 刪除特定記憶
   */
  async deleteMemory(id: string) {
    if (!this.collection) await this.initCollection();
    await this.collection!.delete({ ids: [id] });
  }
}
