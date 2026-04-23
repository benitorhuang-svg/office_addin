"""
Python skill tests — runs via pytest in CI.
Tests FastAPI skill bridge endpoints directly (no Node.js subprocess).
"""
import json
import sys
import os
import pytest

# Ensure src/skills and its shared folder are on the path
base_dir = os.path.join(os.path.dirname(__file__), '..')
sys.path.insert(0, base_dir)
sys.path.insert(0, os.path.join(base_dir, 'shared'))

# ── VectorNexus unit test (no external API call) ───────────────────────────

class TestVectorNexus:
    def test_import(self):
        """VectorNexus class is importable without crashing."""
        from vector_nexus import VectorNexus  # type: ignore
        assert VectorNexus is not None

    def test_constructor_without_api_key(self):
        """Should initialize without API key (offline mode)."""
        from vector_nexus import VectorNexus  # type: ignore
        # Should not raise even without API key
        vn = VectorNexus(api_key='')
        assert vn is not None


# ── FastAPI skill bridge integration tests ────────────────────────────────

@pytest.fixture
def client():
    """Return a TestClient for the FastAPI skill bridge."""
    try:
        from httpx import Client  # type: ignore
        from skill_bridge import app  # type: ignore
        from starlette.testclient import TestClient  # type: ignore
        return TestClient(app)
    except ImportError:
        pytest.skip("skill_bridge not yet available")


class TestSkillBridgeHealth:
    def test_health_endpoint(self, client):
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert "skills" in data

    def test_skills_listed(self, client):
        response = client.get("/health")
        skills = response.json()["skills"]
        assert "excel" in skills
        assert "ppt" in skills
        assert "word" in skills


class TestExcelSkillEndpoint:
    def test_missing_payload_returns_422(self, client):
        response = client.post("/skills/excel", json={})
        assert response.status_code == 422

    def test_invalid_changes_type(self, client):
        payload = {"input_path": "test.xlsx", "output_path": "out.xlsx", "changes": "not-a-list"}
        response = client.post("/skills/excel", json=payload)
        assert response.status_code == 422
