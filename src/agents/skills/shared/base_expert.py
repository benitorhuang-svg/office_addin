from __future__ import annotations
from typing import Any

class BaseExpertSkill:
    """
    P3 Optimized: Shared base class for all Office Expert Skills.
    Consolidates dispatch logic and error isolation.
    """
    _DISPATCH: dict[str, str] = {}

    def apply_ops(self, ops: list[dict[str, Any]]) -> list[str]:
        """Apply an ordered list of operations with error isolation."""
        applied: list[str] = []
        for op in ops:
            op_name = op.get("op", "")
            method_name = self._DISPATCH.get(op_name)
            if method_name:
                try:
                    getattr(self, method_name)(op)
                    applied.append(op_name)
                except Exception as e:
                    # P1 Fix: Error isolation per operation
                    applied.append(f"ERROR:{op_name}:{str(e)}")
            else:
                applied.append(f"SKIPPED_UNKNOWN:{op_name}")
        return applied
