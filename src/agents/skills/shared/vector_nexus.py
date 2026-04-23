import sys
import json
import hashlib
import os
import time
import numpy as np
import google.generativeai as genai
from typing import List, Optional

# Default persistence path: src/agents/skills/output/vector_index.json
_DEFAULT_INDEX_PATH = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "..", "output", "vector_index.json"
)

# Industrial-grade Semantic Search Engine with Incremental Indexing (2026 Edition)
class VectorNexus:
    def __init__(self, api_key: str, index_path: Optional[str] = None):
        if api_key:
            genai.configure(api_key=api_key)
        self.model = "models/text-embedding-004"  # 2026 Stable GEMINI V4 Embedding
        self._index_path = index_path or _DEFAULT_INDEX_PATH
        # Cache: { sha256_hex -> {"embedding": [...], "timestamp": float} }
        self._cache: dict = {}
        self._load_index()

    # ── Index persistence ──────────────────────────────────────────────────

    @staticmethod
    def _compute_hash(text: str) -> str:
        """SHA-256 fingerprint of the text content."""
        return hashlib.sha256(text.encode("utf-8")).hexdigest()

    def _load_index(self) -> None:
        """Load persisted embedding index from disk (no-op if file doesn't exist)."""
        try:
            if os.path.exists(self._index_path):
                with open(self._index_path, "r", encoding="utf-8") as f:
                    self._cache = json.load(f)
        except (json.JSONDecodeError, OSError):
            self._cache = {}

    def _save_index(self) -> None:
        """Persist embedding index to disk, creating parent directories if needed."""
        try:
            os.makedirs(os.path.dirname(self._index_path), exist_ok=True)
            with open(self._index_path, "w", encoding="utf-8") as f:
                json.dump(self._cache, f, separators=(",", ":"))
        except OSError:
            pass  # Disk errors are non-fatal — just skip persistence

    # ── Embedding with cache ───────────────────────────────────────────────

    def get_embedding(self, text: str) -> np.ndarray:
        """Return embedding from cache if hash matches; otherwise call Gemini API."""
        h = self._compute_hash(text)
        if h in self._cache:
            return np.array(self._cache[h]["embedding"])

        # Cache miss — call Gemini and persist
        result = genai.embed_content(
            model=self.model,
            content=text,
            task_type="retrieval_document"
        )
        embedding = result["embedding"]
        self._cache[h] = {"embedding": embedding, "timestamp": time.time()}
        self._save_index()
        return np.array(embedding)

    def invalidate(self, text: str) -> bool:
        """Remove a specific document from the cache (e.g., after content update)."""
        h = self._compute_hash(text)
        if h in self._cache:
            del self._cache[h]
            self._save_index()
            return True
        return False

    def cache_size(self) -> int:
        """Return number of cached embeddings."""
        return len(self._cache)

    # ── Semantic search ────────────────────────────────────────────────────

    def semantic_search(self, query: str, documents: List[str], top_k: int = 3):
        """
        RAG: Match agent intent to document sections.
        Incremental: only recomputes embeddings for documents not in cache.
        """
        query_vec = self.get_embedding(query)

        doc_vecs = [self.get_embedding(doc) for doc in documents]

        # Cosine similarity
        similarities = [
            float(np.dot(query_vec, dv) / (np.linalg.norm(query_vec) * np.linalg.norm(dv)))
            for dv in doc_vecs
        ]

        results = sorted(zip(similarities, documents), reverse=True, key=lambda x: x[0])
        return [{"relevance": res[0], "text": res[1]} for res in results[:top_k]]


if __name__ == "__main__":
    try:
        input_data = json.load(sys.stdin)
        api_key = input_data.get("apiKey", "")
        query = input_data.get("query", "")
        docs = input_data.get("docs", [])

        searcher = VectorNexus(api_key)
        results = searcher.semantic_search(query, docs)

        print(json.dumps({"status": "success", "results": results,
                          "cache_size": searcher.cache_size()}))
    except Exception as e:
        print(json.dumps({"error": str(e)}), file=sys.stderr)
        sys.exit(1)

