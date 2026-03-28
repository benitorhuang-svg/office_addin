import json
import sys
import networkx as nx
from typing import List, Dict

class GalaxyGraph:
    """
    The Omniscient Project Galaxy: Entity Relational Map.
    Powered by NetworkX for the Nexus Center ACP.
    """
    def __init__(self):
        self.G = nx.Graph()

    def build_from_metadata(self, entities: List[Dict]):
        # Add nodes and edges based on Agent discovery
        for entity in entities:
            # Add file/concept as node
            self.G.add_node(entity["id"], label=entity["label"], type=entity["type"])
            # Add relationships (e.g., 'related_to', 'part_of')
            for rel in entity.get("relationships", []):
                self.G.add_edge(entity["id"], rel["to"], weight=rel.get("weight", 1.0))
        
    def find_shortest_path(self, start_id: str, end_id: str):
        try:
            path = nx.shortest_path(self.G, source=start_id, target=end_id)
            return {"path": path, "status": "success"}
        except nx.NetworkXNoPath:
            return {"status": "no_path"}

if __name__ == "__main__":
    try:
        input_data = json.load(sys.stdin)
        action = input_data.get("action", "build")
        
        graph = GalaxyGraph()
        if action == "build":
            graph.build_from_metadata(input_data["entities"])
            # Return centrality or some 'intelligent' insights
            centrality = nx.degree_centrality(graph.G)
            print(json.dumps({"status": "built", "centrality": centrality}))
        elif action == "query":
            # Find connections between concepts
            res = graph.find_shortest_path(input_data["start"], input_data["end"])
            print(json.dumps(res))
    except Exception as e:
        print(json.dumps({"error": str(e)}), file=sys.stderr)
        sys.exit(1)
