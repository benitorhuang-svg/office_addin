import sys
import json
from docx import Document
from docx.shared import Pt, RGBColor

def transform_document(input_path, output_path, changes):
    """
    An 'Elegant' document transformer for AI agents.
    It applies high-fidelity formatting based on Agent logic.
    """
    doc = Document(input_path)
    
    # Process each change requested by the Agent
    for change in changes:
        action = change.get("action")
        target = change.get("target") # index or text search
        
        if action == "bold_header":
            for para in doc.paragraphs:
                if target in para.text:
                    for run in para.runs:
                        run.bold = True
                        run.font.size = Pt(14)
                        run.font.color.rgb = RGBColor(0x00, 0x8C, 0xA1) # Cyan
        
    doc.save(output_path)
    return {"status": "success", "file": output_path}

if __name__ == "__main__":
    try:
        # ACP Protocol Data Input
        input_data = json.load(sys.stdin)
        result = transform_document(
            input_data["input"], 
            input_data["output"], 
            input_data["changes"]
        )
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"error": str(e)}), file=sys.stderr)
        sys.exit(1)
