from __future__ import annotations

import json
import os
import sys
from typing import Any

from docx import Document
from docx.shared import Pt, RGBColor
from base_expert import BaseExpertSkill

# ── Brand defaults ────────────────────────────────────────────────────────
NEXUS_CYAN = RGBColor(0x00, 0x8C, 0xA1)


class WordExpertSkill(BaseExpertSkill):
    """
    Industrial Word Hub: High-fidelity document creation and editing.
    P3 Optimized: Inherits from BaseExpertSkill + List Support.
    """

    def __init__(self, doc_path: str | None = None) -> None:
        self.doc = Document(doc_path) if doc_path else Document()

    # ── Individual operation handlers ──────────────────────────────────────

    def _op_insert_heading(self, op: dict[str, Any]) -> None:
        if "text" not in op: raise ValueError("insert_heading requires 'text'")
        self.doc.add_heading(op.get("text", ""), level=op.get("level", 1))

    def _op_insert_paragraph(self, op: dict[str, Any]) -> None:
        if "text" not in op: raise ValueError("insert_paragraph requires 'text'")
        try:
            self.doc.add_paragraph(op.get("text", ""), style=op.get("style", "Normal"))
        except KeyError:
            self.doc.add_paragraph(op.get("text", ""))

    def _op_insert_list(self, op: dict[str, Any]) -> None:
        """P3: { op: "insert_list", items: list[str], style: 'List Bullet' | 'List Number' }"""
        style = op.get("style", "List Bullet")
        for item in op.get("items", []):
            self.doc.add_paragraph(item, style=style)

    def _op_bold_header(self, op: dict[str, Any]) -> None:
        if "target" not in op: raise ValueError("bold_header requires 'target'")
        target = op.get("target", "")
        size_pt = op.get("font_size_pt", 14)
        for para in self.doc.paragraphs:
            if target in para.text:
                for run in para.runs:
                    run.bold = True
                    run.font.size = Pt(size_pt)
                    run.font.color.rgb = NEXUS_CYAN

    def _op_find_replace(self, op: dict[str, Any]) -> None:
        find_text = op.get("find", "")
        replace_text = op.get("replace", "")
        for para in self.doc.paragraphs:
            if find_text in para.text:
                for run in para.runs:
                    if find_text in run.text:
                        run.text = run.text.replace(find_text, replace_text)

    def _op_insert_table(self, op: dict[str, Any]) -> None:
        table = self.doc.add_table(rows=op.get("rows", 1), cols=op.get("cols", 1))
        table.style = op.get("style", "Table Grid")
        data = op.get("data", [])
        for r_idx, row_data in enumerate(data[:op.get("rows", 1)]):
            for c_idx, cell_text in enumerate(row_data[:op.get("cols", 1)]):
                table.rows[r_idx].cells[c_idx].text = str(cell_text)

    def _op_add_page_break(self, _op: dict[str, Any]) -> None:
        self.doc.add_page_break()

    def _op_set_font(self, op: dict[str, Any]) -> None:
        if "target" not in op: raise ValueError("set_font requires 'target'")
        target = op.get("target", "")
        for para in self.doc.paragraphs:
            if target in para.text:
                for run in para.runs:
                    if op.get("font_name"): run.font.name = op["font_name"]
                    if op.get("size_pt"): run.font.size = Pt(op["size_pt"])
                    if op.get("bold") is not None: run.bold = op["bold"]

    # ── Dispatch table ─────────────────────────────────────────────────────

    _DISPATCH = {
        "insert_heading":   "_op_insert_heading",
        "insert_paragraph": "_op_insert_paragraph",
        "insert_list":      "_op_insert_list",
        "bold_header":      "_op_bold_header",
        "find_replace":     "_op_find_replace",
        "insert_table":     "_op_insert_table",
        "add_page_break":   "_op_add_page_break",
        "set_font":         "_op_set_font",
    }

    def save_document(self, output_path: str) -> dict[str, Any]:
        parent_dir = os.path.dirname(output_path)
        if parent_dir and not os.path.exists(parent_dir):
            os.makedirs(parent_dir, exist_ok=True)
        self.doc.save(output_path)
        return {"status": "success", "file": output_path}


def run(payload: dict[str, Any]) -> dict[str, Any]:
    input_path = payload.get("input") or payload.get("input_path") or ""
    output_path = payload.get("output") or payload.get("output_path", "output.docx")
    edits: list[dict[str, Any]] = payload.get("edits", payload.get("changes", []))

    expert = WordExpertSkill(input_path if input_path else None)
    applied = expert.apply_ops(edits)
    result = expert.save_document(output_path)
    result["applied_operations"] = applied
    return result


if __name__ == "__main__":
    try:
        input_data = json.load(sys.stdin)
        result = run(input_data)
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"error": str(e)}), file=sys.stderr)
        sys.exit(1)
