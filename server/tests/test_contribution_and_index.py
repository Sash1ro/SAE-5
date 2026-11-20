import json
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

import controller.index_controller as index_controller


def test_submit_contribution_saves_image_metadata_and_history(
    client: TestClient,
    auth_headers: dict,
    isolated_environment: dict,
    make_jpeg_bytes,
):
    img_bytes = make_jpeg_bytes()
    res = client.post(
        "/api/contributions",
        data={"universe_name": "  Vagabond ", "universe_volume": "1"},
        files={"image": ("vagabond.png", img_bytes, "image/png")},
        headers=auth_headers,
    )

    assert res.status_code == 201
    body = res.json()
    assert body["status"] == "success"
    entry_id = body["id"]

    pending_dir: Path = isolated_environment["pending_dir"]
    saved_img = pending_dir / f"{entry_id}.png"
    saved_meta = pending_dir / f"{entry_id}.json"

    assert saved_img.exists()
    assert saved_meta.exists()

    meta = json.loads(saved_meta.read_text(encoding="utf-8"))
    assert meta["universe"] == "Vagabond"
    assert meta["tome"] == 1

    history = client.get("/api/user/history", headers=auth_headers).json()
    assert len(history) == 1
    assert history[0]["history_type"] == "contribution"


def test_index_version_and_download(client: TestClient, isolated_environment: dict):
    default_version = client.get("/api/index/version")
    assert default_version.status_code == 200
    assert default_version.json() == {"version": 1}

    missing_index = client.get("/api/index/download")
    assert missing_index.status_code == 404

    version_file: Path = isolated_environment["version_file"]
    index_file: Path = isolated_environment["index_file"]
    version_file.write_text(json.dumps({"version": 7}), encoding="utf-8")
    index_file.write_text(
        json.dumps({"labels": ["One Piece_1"], "embeddings": [[0.1, 0.2]]}),
        encoding="utf-8",
    )

    updated_version = client.get("/api/index/version")
    assert updated_version.json() == {"version": 7}

    download = client.get("/api/index/download")
    assert download.status_code == 200
    assert download.json()["labels"] == ["One Piece_1"]


def test_batch_run_requires_valid_api_key(client: TestClient, monkeypatch: pytest.MonkeyPatch):
    monkeypatch.setattr(index_controller, "run_batch_update", lambda: 12)

    unauthorized = client.post("/api/batch/run", headers={"x-batch-key": "wrong-key"})
    assert unauthorized.status_code == 401

    authorized = client.post("/api/batch/run", headers={"x-batch-key": "test-batch-secret-key"})
    assert authorized.status_code == 200
    assert authorized.json() == {"status": "success", "processed_mangas": 12}