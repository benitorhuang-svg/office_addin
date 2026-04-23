from __future__ import annotations

import json
import os
import sys
from typing import Any

from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.util import Inches, Pt
from base_expert import BaseExpertSkill

# ── Brand defaults ────────────────────────────────────────────────────────
NEXUS_BLUE = RGBColor(0x00, 0x8C, 0xA1)
DEFAULT_FONT = "Calibri"


class PPTMasterSkill(BaseExpertSkill):
    """
    Industrial PPT Design Master: High-fidelity layout and content orchestration.
    P3 Optimized: Inherits from BaseExpertSkill + Text Formatting.
    """

    def __init__(self, ppt_path: str | None = None) -> None:
        self.prs = Presentation(ppt_path) if ppt_path else Presentation()

    # ── Individual operation handlers ──────────────────────────────────────

    def _op_add_slide(self, op: dict[str, Any]) -> None:
        layout_idx = op.get("layout_index", 1)
        layout_idx = min(layout_idx, len(self.prs.slide_layouts) - 1)
        slide_layout = self.prs.slide_layouts[layout_idx]
        slide = self.prs.slides.add_slide(slide_layout)
        if slide.shapes.title and op.get("title"):
            slide.shapes.title.text = op["title"]
        if op.get("body") and len(slide.placeholders) > 1:
            body_ph = slide.placeholders[1]
            body_ph.text = op["body"]
            for para in body_ph.text_frame.paragraphs:
                for run in para.runs:
                    run.font.size = Pt(op.get("font_size_pt", 20))
                    run.font.name = op.get("font", DEFAULT_FONT)

    def _op_insert_text(self, op: dict[str, Any]) -> None:
        if "slide_index" not in op or "shape_name" not in op or "text" not in op:
            raise ValueError("insert_text requires 'slide_index', 'shape_name', and 'text'")
        slide_idx = op.get("slide_index", 0)
        if slide_idx >= len(self.prs.slides):
            raise IndexError("Slide index out of range")
        slide = self.prs.slides[slide_idx]
        for shape in slide.shapes:
            if shape.name == op.get("shape_name") and shape.has_text_frame:
                shape.text_frame.text = op["text"]
                return
        raise KeyError(f"Shape '{op['shape_name']}' not found")

    def _op_set_font(self, op: dict[str, Any]) -> None:
        """P3: { op: "set_font", slide_index: int, shape_name: str, size_pt?: int, bold?: bool, color?: hex }"""
        slide_idx = op.get("slide_index", 0)
        slide = self.prs.slides[slide_idx]
        for shape in slide.shapes:
            if shape.name == op.get("shape_name") and shape.has_text_frame:
                for para in shape.text_frame.paragraphs:
                    for run in para.runs:
                        if op.get("size_pt"): run.font.size = Pt(op["size_pt"])
                        if op.get("bold") is not None: run.font.bold = op["bold"]
                        if op.get("color"): 
                            run.font.color.rgb = RGBColor.from_string(op["color"].lstrip("#"))

    def _op_add_image(self, op: dict[str, Any]) -> None:
        """P3: { op: "add_image", slide_index: int, image_path: str, left_in?: float, top_in?: int }"""
        slide = self.prs.slides[op.get("slide_index", 0)]
        slide.shapes.add_picture(
            op["image_path"], 
            Inches(op.get("left_in", 1.0)), 
            Inches(op.get("top_in", 1.0)),
            width=Inches(op.get("width_in", 2.0)) if "width_in" in op else None
        )

    def _op_add_title_slide(self, op: dict[str, Any]) -> None:
        slide = self.prs.slides.add_slide(self.prs.slide_layouts[0])
        if slide.shapes.title: slide.shapes.title.text = op.get("title", "")
        if len(slide.placeholders) > 1 and op.get("subtitle"):
            slide.placeholders[1].text = op["subtitle"]

    def _op_set_slide_notes(self, op: dict[str, Any]) -> None:
        slide_idx = op.get("slide_index", 0)
        if slide_idx < len(self.prs.slides):
            self.prs.slides[slide_idx].notes_slide.notes_text_frame.text = op.get("notes", "")

    def _op_set_background_color(self, op: dict[str, Any]) -> None:
        slide = self.prs.slides[op.get("slide_index", 0)]
        fill = slide.background.fill
        fill.solid()
        fill.fore_color.rgb = RGBColor.from_string(op.get("hex_color", "FFFFFF").lstrip("#"))

    # ── Dispatch table ─────────────────────────────────────────────────────

    _DISPATCH = {
        "add_slide":             "_op_add_slide",
        "add_title_slide":       "_op_add_title_slide",
        "insert_text":           "_op_insert_text",
        "set_slide_notes":       "_op_set_slide_notes",
        "set_background_color":  "_op_set_background_color",
        "set_font":              "_op_set_font",
        "add_image":             "_op_add_image",
    }

    def save_presentation(self, output_path: str) -> dict[str, Any]:
        parent_dir = os.path.dirname(output_path)
        if parent_dir and not os.path.exists(parent_dir):
            os.makedirs(parent_dir, exist_ok=True)
        self.prs.save(output_path)
        return {"status": "success", "file": output_path, "slide_count": len(self.prs.slides)}


def run(payload: dict[str, Any]) -> dict[str, Any]:
    input_path = payload.get("input") or payload.get("input_path") or ""
    output_path = payload.get("output") or payload.get("output_path", "output.pptx")
    slides: list[dict[str, Any]] = payload.get("slides", payload.get("changes", []))

    master = PPTMasterSkill(input_path if input_path else None)
    applied = master.apply_ops(slides)
    result = master.save_presentation(output_path)
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
