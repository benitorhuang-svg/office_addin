from __future__ import annotations
from typing import Any, Dict, List, Optional

class BaseExpertSkill:
    """
    P3 Optimized: Shared base class for all Office Expert Skills.
    Consolidates dispatch logic and error isolation.
    """
    _DISPATCH: Dict[str, str] = {}

    def apply_ops(self, ops: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Apply an ordered list of operations with error isolation."""
        applied: List[Dict[str, Any]] = []
        for op in ops:
            op_name = op.get("op", "")
            method_name = self._DISPATCH.get(op_name)
            if method_name:
                try:
                    method = getattr(self, method_name, None)
                    if method:
                        method(op)
                        applied.append({
                            "op": op_name, 
                            "status": "success", 
                            "metadata": op.get("metadata")
                        })
                    else:
                        applied.append({
                            "op": op_name, 
                            "status": "error", 
                            "message": f"Method {method_name} not found on expert",
                            "metadata": op.get("metadata")
                        })
                except Exception as e:
                    # P1 Fix: Error isolation per operation
                    applied.append({
                        "op": op_name, 
                        "status": "error", 
                        "message": str(e),
                        "metadata": op.get("metadata")
                    })
            else:
                applied.append({
                    "op": op_name, 
                    "status": "skipped", 
                    "message": f"unknown operation: {op_name}",
                    "metadata": op.get("metadata")
                })
        return applied
