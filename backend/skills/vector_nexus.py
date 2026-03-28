import sys
import json
import numpy as np
import google.generativeai as genai
from typing import List

# Industrial-grade Semantic Search Engine (2026 Edition)
class VectorNexus:
    def __init__(self, api_key: str):
        if api_key:
            genai.configure(api_key=api_key)
        self.model = "models/text-embedding-004" # 2026 Stable GEMINI V4 Embedding

    def get_embedding(self, text: str):
        # AI-Protocol: Unified Embedding Retrieval
        result = genai.embed_content(
            model=self.model,
            content=text,
            task_type="retrieval_document"
        )
        return np.array(result['embedding'])

    def semantic_search(self, query: str, documents: List[str], top_k: int = 3):
        """
        'Elegant' RAG: Matches the Agent's intent to document sections.
        """
        query_vec = self.get_embedding(query)
        
        doc_vecs = []
        for doc in documents:
            doc_vecs.append(self.get_embedding(doc))
        
        # Pure Vector Math: Cosine Similarity
        similarities = [np.dot(query_vec, doc_vec) / (np.linalg.norm(query_vec) * np.linalg.norm(doc_vec))
                        for doc_vec in doc_vecs]
        
        # Zip and Sort by Relevance
        results = sorted(zip(similarities, documents), reverse=True, key=lambda x: x[0])
        return [{"relevance": float(res[0]), "text": res[1]} for res in results[:top_k]]

if __name__ == "__main__":
    try:
        # ACP Protocol: Stream-based Skill Input
        input_data = json.load(sys.stdin)
        api_key = input_data.get("apiKey", "")
        query = input_data.get("query", "")
        docs = input_data.get("docs", []) # Agent provides content snippets
        
        searcher = VectorNexus(api_key)
        results = searcher.semantic_search(query, docs)
        
        print(json.dumps({"status": "success", "results": results}))
    except Exception as e:
        print(json.dumps({"error": str(e)}), file=sys.stderr)
        sys.exit(1)
