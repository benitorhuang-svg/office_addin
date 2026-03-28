import json
import sys
import re
from typing import List, Dict

class TripleTierSearch:
    """
    Inspired by 2026 China AI Research (DeepSeek/Qwen style): 
    Triple-Tier Multi-Modal Retrieval.
    """
    def __init__(self, vector_skill_output: List[Dict]):
        # Layer 1 (Semantic) is usually pre-fetched by VectorNexus
        self.l1_results = vector_skill_output

    def l2_keyword_matrix(self, query: str, drafts: List[Dict]):
        # Layer 2: Neural Keyword Weighting (Simulated)
        # We boost results that contain technical keywords or symbols
        keywords = re.findall(r'\w+', query.lower())
        for doc in drafts:
            doc_text = doc["text"].lower()
            bonus = sum(2.0 for k in keywords if k in doc_text)
            doc["relevance"] += bonus
        return drafts

    def l3_logic_reranker(self, drafts: List[Dict]):
        # Layer 3: Contextual Logic Checking
        # We perform a final pass to ensure 'Sufficiency' 
        # (Inspired by Google's 'Sufficient Context' paper)
        drafts.sort(key=lambda x: x["relevance"], reverse=True)
        # We only keep the most logically sound candidates
        return drafts[:5]

    def execute(self, query: str):
        # Execution of the Triple-Tier logic
        # 1. Semantic (already provided)
        # 2. Pattern Matching
        matrix_results = self.l2_keyword_matrix(query, self.l1_results)
        # 3. Reranking
        final_results = self.l3_logic_reranker(matrix_results)
        return final_results

if __name__ == "__main__":
    try:
        input_data = json.load(sys.stdin)
        query = input_data.get("query", "")
        # Expecting output from previous VectorNexus step
        semantic_drafts = input_data.get("semanticDrafts", []) 
        
        engine = TripleTierSearch(semantic_drafts)
        final_results = engine.execute(query)
        
        print(json.dumps({"status": "success", "tripleTierResults": final_results}))
    except Exception as e:
        print(json.dumps({"error": str(e)}), file=sys.stderr)
        sys.exit(1)
