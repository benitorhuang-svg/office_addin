"""
FastAPI Skill Bridge — replaces cold-start Python subprocess pattern.

Exposes HTTP endpoints for Excel, PPT, Word, and vector-search skills.
Runs on port 8765 (configurable via SKILL_BRIDGE_PORT env var).

Start: uvicorn skill_bridge:app --host 127.0.0.1 --port 8765 --reload
"""
from __future__ import annotations

import importlib
import json
import logging
import os
import sys
import asyncio
from typing import Any, Optional

import uvicorn
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel, field_validator

# Ensure the shared skills directory is on the path
_BASE_DIR = os.path.dirname(os.path.abspath(__file__))
_AGENTS_DIR = os.path.join(_BASE_DIR, "..")
sys.path.insert(0, _BASE_DIR)
sys.path.insert(0, os.path.join(_AGENTS_DIR, "expert-excel", "domain"))
sys.path.insert(0, os.path.join(_AGENTS_DIR, "expert-ppt", "domain"))
sys.path.insert(0, os.path.join(_AGENTS_DIR, "expert-word", "domain"))
sys.path.insert(0, os.path.join(_BASE_DIR, "shared"))

logging.basicConfig(
    level=logging.INFO,
    format='{"time": "%(asctime)s", "level": "%(levelname)s", "msg": "%(message)s"}',
)
log = logging.getLogger("skill_bridge")

app = FastAPI(title="Nexus Skill Bridge", version="1.1.0")

# ── Request / Response schemas ────────────────────────────────────────────

class ExcelRequest(BaseModel):
    # P0: Allow optional paths for flexibility (empty string = new file)
    input_path: Optional[str] = ""
    output_path: Optional[str] = "output.xlsx"
    changes: list[dict[str, Any]]

    @field_validator("changes")
    @classmethod
    def changes_not_empty(cls, v: list) -> list:
        if not isinstance(v, list):
            raise ValueError("changes must be a list")
        return v


class PPTRequest(BaseModel):
    input_path: Optional[str] = ""
    output_path: Optional[str] = "output.pptx"
    slides: list[dict[str, Any]]

    @field_validator("slides")
    @classmethod
    def slides_not_empty(cls, v: list) -> list:
        if not isinstance(v, list):
            raise ValueError("slides must be a list")
        return v


class WordRequest(BaseModel):
    input_path: Optional[str] = ""
    output_path: Optional[str] = "output.docx"
    edits: list[dict[str, Any]]

    @field_validator("edits")
    @classmethod
    def edits_not_empty(cls, v: list) -> list:
        if not isinstance(v, list):
            raise ValueError("edits must be a list")
        return v


class VectorSearchRequest(BaseModel):
    query: str
    documents: list[str]
    top_k: int = 5


# ── Helpers ───────────────────────────────────────────────────────────────

def _invoke_python_skill(module_name: str, func_name: str, payload: dict[str, Any]) -> Any:
    """Dynamically import a skill module and invoke its main function."""
    try:
        # P0 Fix: Handle module reload if necessary or ensured path
        mod = importlib.import_module(module_name)
    except ModuleNotFoundError as e:
        log.error(f"Module not found: {module_name} — {e}")
        raise HTTPException(status_code=503, detail=f"Skill module '{module_name}' not available")
    
    fn = getattr(mod, func_name, None)
    if fn is None:
        raise HTTPException(status_code=503, detail=f"Function '{func_name}' not found in '{module_name}'")
    
    try:
        return fn(payload)
    except Exception as exc:
        log.error(f"Skill '{module_name}.{func_name}' raised: {exc}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(exc))


def _run_expert_skill(python_module: str, payload: dict[str, Any]) -> Any:
    """
    Run an expert skill dynamically via its `run(payload_dict) -> dict` entry point.
    """
    return _invoke_python_skill(python_module, "run", payload)


# ── Endpoints ─────────────────────────────────────────────────────────────

@app.get("/health")
async def health() -> dict[str, Any]:
    """Health probe — used by Node.js bridge client and CI."""
    return {
        "status": "ok",
        "skills": ["excel", "ppt", "word", "vector-search"],
        "version": "1.1.0",
    }


@app.post("/skills/excel")
async def invoke_excel(req: ExcelRequest) -> dict[str, Any]:
    """Invoke ExcelExpert skill asynchronously using thread pool."""
    log.info(f"Excel skill: {req.input_path} → {req.output_path}")
    payload = {"input": req.input_path, "output": req.output_path, "changes": req.changes}
    # P1: Prevent blocking event loop
    result = await asyncio.to_thread(_run_expert_skill, "excel_expert", payload)
    return result if isinstance(result, dict) else {"result": result}


@app.post("/skills/ppt")
async def invoke_ppt(req: PPTRequest) -> dict[str, Any]:
    """Invoke PPTMaster skill asynchronously using thread pool."""
    log.info(f"PPT skill: {req.input_path} → {req.output_path}")
    payload = {"input": req.input_path, "output": req.output_path, "slides": req.slides}
    # P1: Prevent blocking event loop
    result = await asyncio.to_thread(_run_expert_skill, "ppt_expert", payload)
    return result if isinstance(result, dict) else {"result": result}


@app.post("/skills/word")
async def invoke_word(req: WordRequest) -> dict[str, Any]:
    """Invoke WordExpert skill asynchronously using thread pool."""
    log.info(f"Word skill: {req.input_path} → {req.output_path}")
    payload = {"input": req.input_path, "output": req.output_path, "edits": req.edits}
    # P1: Prevent blocking event loop
    result = await asyncio.to_thread(_run_expert_skill, "word_expert", payload)
    return result if isinstance(result, dict) else {"result": result}


@app.post("/skills/vector-search")
async def invoke_vector_search(req: VectorSearchRequest) -> dict[str, Any]:
    """Invoke vector semantic search — no cold start."""
    log.info(f"Vector search: '{req.query[:80]}', top_k={req.top_k}")
    try:
        from vector_nexus import VectorNexus  # type: ignore
        api_key = os.environ.get("GEMINI_API_KEY", "")
        vn = VectorNexus(api_key=api_key)
        results = vn.semantic_search(req.query, req.documents, top_k=req.top_k)
        return {"results": results}
    except Exception as exc:
        log.error(f"Vector search failed: {exc}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(exc))


# ── Error handlers ────────────────────────────────────────────────────────

@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    error_msg = str(exc)
    import datetime
    error_payload = {
        "time": datetime.datetime.now().isoformat(),
        "level": "ERROR",
        "msg": f"Unhandled error on {request.url}: {error_msg}",
        "type": "exception",
        "url": str(request.url)
    }
    sys.stderr.write(json.dumps(error_payload) + "\n")
    sys.stderr.flush()
    
    return JSONResponse(
        status_code=500, 
        content={"detail": "Internal skill bridge error", "error": error_msg}
    )


# ── Entry point ───────────────────────────────────────────────────────────

if __name__ == "__main__":
    port = int(os.environ.get("SKILL_BRIDGE_PORT", "8765"))
    log.info(f"Starting Nexus Skill Bridge on port {port}")
    uvicorn.run("skill_bridge:app", host="127.0.0.1", port=port, reload=False)
