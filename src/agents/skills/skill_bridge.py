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
import time
from contextlib import asynccontextmanager
from concurrent.futures import ThreadPoolExecutor
from typing import Any, Optional

import uvicorn
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel, field_validator

# Ensure the shared skills directory is on the path
_BASE_DIR = os.path.dirname(os.path.abspath(__file__))
_AGENTS_DIR = os.path.join(_BASE_DIR, "..")
_SDK_DIR = os.path.join(_AGENTS_DIR, "..", "sdk")
sys.path.insert(0, _BASE_DIR)
sys.path.insert(0, os.path.join(_AGENTS_DIR, "expert-excel", "domain"))
sys.path.insert(0, os.path.join(_AGENTS_DIR, "expert-ppt", "domain"))
sys.path.insert(0, os.path.join(_AGENTS_DIR, "expert-word", "domain"))
sys.path.insert(0, os.path.join(_BASE_DIR, "shared"))
sys.path.insert(0, os.path.join(_SDK_DIR, "core", "transport", "acp"))

logging.basicConfig(
    level=logging.INFO,
    format='{"time": "%(asctime)s", "level": "%(levelname)s", "msg": "%(message)s"}',
)
log = logging.getLogger("skill_bridge")

# ── Concurrency Control ──────────────────────────────────────────────────
# P3: Limit max concurrent Office/Python tasks to prevent system OOM
MAX_WORKERS = int(os.environ.get("SKILL_BRIDGE_MAX_WORKERS", "10"))
executor = ThreadPoolExecutor(max_workers=MAX_WORKERS)

# ── Lifespan Management ───────────────────────────────────────────────────
_VECTOR_NEXUS_INSTANCE: Any = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Pre-load heavy resources like embedding models during startup."""
    global _VECTOR_NEXUS_INSTANCE
    log.info("Lifespan: Initializing skill resources...")
    try:
        from vector_nexus import VectorNexus
        api_key = os.environ.get("GEMINI_API_KEY", "")
        log.info(f"Lifespan: Loading VectorNexus (API Key present: {bool(api_key)})")
        _VECTOR_NEXUS_INSTANCE = VectorNexus(api_key=api_key)
    except Exception as e:
        log.warning(f"Lifespan: VectorNexus pre-load failed (offline mode): {e}")
    
    yield
    log.info("Lifespan: Shutting down...")
    executor.shutdown(wait=True)

app = FastAPI(title="Nexus Skill Bridge", version="1.2.0", lifespan=lifespan)

# ── Request / Response schemas ────────────────────────────────────────────

class ExcelRequest(BaseModel):
    input_path: Optional[str] = ""
    output_path: Optional[str] = "output.xlsx"
    changes: list[dict[str, Any]]
    office_context: Optional[dict[str, Any]] = None

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
    office_context: Optional[dict[str, Any]] = None

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
    office_context: Optional[dict[str, Any]] = None

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
        mod = importlib.import_module(module_name)
    except ModuleNotFoundError as e:
        log.error(f"Module not found: {module_name}")
        raise HTTPException(status_code=503, detail=f"Skill module '{module_name}' not available")
    
    fn = getattr(mod, func_name, None)
    if fn is None:
        raise HTTPException(status_code=503, detail=f"Function '{func_name}' not found in '{module_name}'")
    
    try:
        return fn(payload)
    except Exception as exc:
        log.error(f"Skill execution failed: {module_name}.{func_name}")
        raise HTTPException(status_code=500, detail=str(exc))

async def _run_in_pool(python_module: str, payload: dict[str, Any]) -> Any:
    """Run heavy CPU-bound tasks in the limited thread pool."""
    loop = asyncio.get_running_loop()
    return await loop.run_in_executor(executor, _invoke_python_skill, python_module, "run", payload)

# ── Middleware for telemetry ──────────────────────────────────────────────

@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    log.info(f"Processed {request.url.path} in {process_time:.4f}s")
    return response

# ── Endpoints ─────────────────────────────────────────────────────────────

@app.get("/health")
async def health() -> dict[str, Any]:
    return {
        "status": "ok",
        "skills": ["excel", "ppt", "word", "vector-search"],
        "version": "1.2.0",
        "concurrency": {"max_workers": MAX_WORKERS}
    }

@app.post("/skills/excel")
async def invoke_excel(req: ExcelRequest) -> dict[str, Any]:
    payload = {"input": req.input_path, "output": req.output_path, "changes": req.changes, "office_context": req.office_context}
    return await _run_in_pool("excel_expert", payload)

@app.post("/skills/ppt")
async def invoke_ppt(req: PPTRequest) -> dict[str, Any]:
    payload = {"input": req.input_path, "output": req.output_path, "slides": req.slides, "office_context": req.office_context}
    return await _run_in_pool("ppt_expert", payload)

@app.post("/skills/word")
async def invoke_word(req: WordRequest) -> dict[str, Any]:
    payload = {"input": req.input_path, "output": req.output_path, "edits": req.edits, "office_context": req.office_context}
    return await _run_in_pool("word_expert", payload)

@app.post("/skills/vector-search")
async def invoke_vector_search(req: VectorSearchRequest) -> dict[str, Any]:
    global _VECTOR_NEXUS_INSTANCE
    if not _VECTOR_NEXUS_INSTANCE:
        from vector_nexus import VectorNexus
        _VECTOR_NEXUS_INSTANCE = VectorNexus(api_key=os.environ.get("GEMINI_API_KEY", ""))
    
    try:
        results = _VECTOR_NEXUS_INSTANCE.semantic_search(req.query, req.documents, top_k=req.top_k)
        return {"results": results}
    except Exception as exc:
        log.error(f"Vector search failed: {exc}")
        raise HTTPException(status_code=500, detail=str(exc))

@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    error_msg = str(exc)
    log.error(f"Unhandled error on {request.url}: {error_msg}")
    return JSONResponse(
        status_code=500, 
        content={"detail": "Internal skill bridge error", "error": error_msg}
    )

if __name__ == "__main__":
    port = int(os.environ.get("SKILL_BRIDGE_PORT", "8765"))
    log.info(f"Starting Nexus Skill Bridge on port {port}")
    uvicorn.run("skill_bridge:app", host="127.0.0.1", port=port, reload=False)
