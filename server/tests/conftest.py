import os
import sys
from pathlib import Path
from typing import Callable, Dict, Tuple

os.environ["DATABASE_URL"] = "sqlite://"
os.environ["BATCH_API_KEY"] = "test-batch-secret-key"

SERVER_ROOT = Path(__file__).resolve().parent.parent
if str(SERVER_ROOT) not in sys.path:
    sys.path.insert(0, str(SERVER_ROOT))

import cv2
import numpy as np
import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine

import config
import controller.contribution_controller as contribution_controller
import controller.index_controller as index_controller
import controller.mangadex_controller as mangadex_controller
import database
from database import get_session
from main import app


@pytest.fixture(autouse=True)
def isolated_environment(tmp_path: Path, monkeypatch: pytest.MonkeyPatch):
    db_path = tmp_path / "test.db"
    engine = create_engine(
        f"sqlite:///{db_path}",
        connect_args={"check_same_thread": False},
    )
    monkeypatch.setattr(database, "engine", engine)
    SQLModel.metadata.create_all(engine)

    pending_dir = tmp_path / "pending"
    public_dir = tmp_path / "public"
    pending_dir.mkdir(parents=True, exist_ok=True)
    public_dir.mkdir(parents=True, exist_ok=True)

    index_file = public_dir / "index_mangas.json"
    version_file = public_dir / "version.json"

    monkeypatch.setattr(config, "PENDING_DIR", pending_dir)
    monkeypatch.setattr(config, "PUBLIC_DIR", public_dir)
    monkeypatch.setattr(config, "INDEX_FILE", index_file)
    monkeypatch.setattr(config, "VERSION_FILE", version_file)

    monkeypatch.setattr(contribution_controller, "PENDING_DIR", pending_dir)
    monkeypatch.setattr(index_controller, "INDEX_FILE", index_file)
    monkeypatch.setattr(index_controller, "VERSION_FILE", version_file)
    monkeypatch.setattr(mangadex_controller, "_next_request_at", 0.0)

    yield {
        "engine": engine,
        "pending_dir": pending_dir,
        "public_dir": public_dir,
        "index_file": index_file,
        "version_file": version_file,
    }

    engine.dispose()


@pytest.fixture
def session(isolated_environment: dict):
    with Session(isolated_environment["engine"]) as db_session:
        yield db_session


@pytest.fixture
def client(isolated_environment: dict):
    engine = isolated_environment["engine"]

    def override_get_session():
        with Session(engine) as db_session:
            yield db_session

    app.dependency_overrides[get_session] = override_get_session
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def auth_headers(client: TestClient) -> Dict[str, str]:
    res = client.post(
        "/api/user/register",
        json={"email": "nino@manganitor.test", "password": "StrongPassword123!"},
    )
    assert res.status_code == 201
    return {"Authorization": f"Bearer {res.json()['token']}"}


@pytest.fixture
def second_auth_headers(client: TestClient) -> Dict[str, str]:
    res = client.post(
        "/api/user/register",
        json={"email": "sashiro@manganitor.test", "password": "StrongPassword123!"},
    )
    assert res.status_code == 201
    return {"Authorization": f"Bearer {res.json()['token']}"}


@pytest.fixture
def make_jpeg_bytes() -> Callable[[int, int, Tuple[int, int, int]], bytes]:
    def _factory(
        width: int = 800,
        height: int = 1100,
        bgr_color: Tuple[int, int, int] = (40, 40, 40),
    ) -> bytes:
        canvas = np.full((height, width, 3), bgr_color, dtype=np.uint8)
        cv2.rectangle(
            canvas,
            (width // 5, height // 5),
            (width * 4 // 5, height * 4 // 5),
            (210, 195, 180),
            -1,
        )
        ok, encoded = cv2.imencode(".jpg", canvas, [int(cv2.IMWRITE_JPEG_QUALITY), 90])
        assert ok
        return encoded.tobytes()

    return _factory
