from __future__ import annotations

import json
import os
import sys
from typing import Any

import openpyxl
from openpyxl.styles import Alignment, Font, PatternFill
from base_expert import BaseExpertSkill

# ── Brand colours ─────────────────────────────────────────────────────────
NEXUS_BLUE = "008CA1"
NEXUS_WHITE = "FFFFFF"


class ExcelExpertSkill(BaseExpertSkill):
    """
    Industrial Excel Hub: High-fidelity data manipulation and reporting.
    P3 Optimized: Inherits from BaseExpertSkill.
    """

    def __init__(self, excel_path: str | None = None) -> None:
        self.wb = openpyxl.load_workbook(excel_path) if excel_path else openpyxl.Workbook()
        self.ws = self.wb.active

    # ── Individual operation handlers ──────────────────────────────────────

    def _op_set_value(self, op: dict[str, Any]) -> None:
        if "cell" not in op or "value" not in op:
            raise ValueError(f"set_value requires 'cell' and 'value'")
        self.ws[op["cell"]] = op["value"]

    def _op_add_formula(self, op: dict[str, Any]) -> None:
        if "cell" not in op or "formula" not in op:
            raise ValueError(f"add_formula requires 'cell' and 'formula'")
        self.ws[op["cell"]] = op["formula"]

    def _op_format_range(self, op: dict[str, Any]) -> None:
        if "range" not in op:
            raise ValueError("format_range requires 'range' key")
        for row in self.ws[op["range"]]:
            for cell in row:
                current_font = cell.font
                new_font_params = {
                    "name": current_font.name,
                    "size": current_font.size,
                    "bold": op.get("bold", current_font.bold),
                    "italic": current_font.italic,
                    "vertAlign": current_font.vertAlign,
                    "underline": current_font.underline,
                    "strike": current_font.strike,
                    "color": current_font.color
                }
                if op.get("font_color"):
                    new_font_params["color"] = op["font_color"].lstrip("#")
                cell.font = Font(**new_font_params)

                if op.get("fill_color"):
                    cell.fill = PatternFill(
                        start_color=op["fill_color"].lstrip("#"),
                        end_color=op["fill_color"].lstrip("#"),
                        fill_type="solid",
                    )

    def _op_set_column_width(self, op: dict[str, Any]) -> None:
        if "column" not in op or "width" not in op:
            raise ValueError("set_column_width requires 'column' and 'width'")
        self.ws.column_dimensions[op["column"]].width = op["width"]

    def _op_merge_cells(self, op: dict[str, Any]) -> None:
        if "range" not in op:
            raise ValueError("merge_cells requires 'range'")
        self.ws.merge_cells(op["range"])

    def _op_add_header_row(self, op: dict[str, Any]) -> None:
        blue_fill = PatternFill(start_color=NEXUS_BLUE, end_color=NEXUS_BLUE, fill_type="solid")
        row_idx = op.get("row", 1)
        for col_idx, header in enumerate(op.get("headers", []), 1):
            cell = self.ws.cell(row=row_idx, column=col_idx)
            cell.value = header
            cell.font = Font(color=NEXUS_WHITE, bold=True, name="Calibri")
            cell.fill = blue_fill
            cell.alignment = Alignment(horizontal="center")

    def _op_create_report(self, op: dict[str, Any]) -> None:
        self.ws["A1"] = op.get("title", "Report")
        self.ws["A1"].font = Font(size=14, bold=True, name="Calibri")
        self.ws["A1"].alignment = Alignment(horizontal="center")
        self._op_add_header_row({"row": 2, "headers": op.get("headers", [])})
        for r_idx, row in enumerate(op.get("data", []), 3):
            for c_idx, val in enumerate(row, 1):
                self.ws.cell(row=r_idx, column=c_idx).value = val

    # ── Dispatch table ─────────────────────────────────────────────────────

    _DISPATCH = {
        "set_value":        "_op_set_value",
        "add_formula":      "_op_add_formula",
        "format_range":     "_op_format_range",
        "set_column_width": "_op_set_column_width",
        "merge_cells":      "_op_merge_cells",
        "add_header_row":   "_op_add_header_row",
        "create_report":    "_op_create_report",
    }

    def save_workbook(self, output_path: str) -> dict[str, Any]:
        parent_dir = os.path.dirname(output_path)
        if parent_dir and not os.path.exists(parent_dir):
            os.makedirs(parent_dir, exist_ok=True)
        self.wb.save(output_path)
        return {"status": "success", "file": output_path}


def run(payload: dict[str, Any]) -> dict[str, Any]:
    input_path = payload.get("input") or payload.get("input_path") or ""
    output_path = payload.get("output") or payload.get("output_path", "output.xlsx")
    changes: list[dict[str, Any]] = payload.get("changes", [])

    expert = ExcelExpertSkill(input_path if input_path else None)
    applied = expert.apply_ops(changes)
    result = expert.save_workbook(output_path)
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
