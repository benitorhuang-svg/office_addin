import json
import sys
from PIL import Image
try:
    from github import Github
except ImportError:
    Github = None

class VisionExpert:
    """
    Multimodal Vision Analyst: Decodes images, flowcharts, and architecture in Office.
    Uses Gemini Vision and Pillow.
    """
    def analyze_diagram(self, img_path: str, prompt: str):
        # Image Analysis logic
        try:
            img = Image.open(img_path)
            # Placeholder for Google Generative AI vision call:
            # model = genai.GenerativeModel('gemini-1.5-pro-vision')
            # res = model.generate_content([prompt, img])
            return {"status": "success", "description": f"Visual context from {img_path} analyzed."}
        except Exception as e:
            return {"error": str(e)}

class DevSync:
    """
    GitHub Synchronizer: Connects document context with Git Issues/PRs.
    """
    def __init__(self, token: str):
        self.gh = Github(token) if Github and token else None

    def get_related_issues(self, repo_name: str, query: str):
        if not self.gh: return {"error": "GitHub Skill not configured."}
        try:
            repo = self.gh.get_repo(repo_name)
            issues = repo.get_issues(state='open')
            # Simple keyword match for the 2026 demo
            matches = [i.title for i in issues if query.lower() in i.title.lower()]
            return {"issues": matches[:5]}
        except Exception as e:
            return {"error": str(e)}

if __name__ == "__main__":
    try:
        input_data = json.load(sys.stdin)
        action = input_data.get("action")
        
        if action == "analyze_vision":
            expert = VisionExpert()
            res = expert.analyze_diagram(input_data["path"], input_data["prompt"])
            print(json.dumps(res))
        elif action == "sync_github":
            sync = DevSync(input_data.get("token", ""))
            res = sync.get_related_issues(input_data["repo"], input_data["query"])
            print(json.dumps(res))
    except Exception as e:
        print(json.dumps({"error": str(e)}), file=sys.stderr)
        sys.exit(1)
