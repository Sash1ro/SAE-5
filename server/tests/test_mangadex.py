from uuid import uuid4

import httpx
import pytest
from fastapi.testclient import TestClient

import controller.mangadex_controller as mangadex_controller


class DummyAsyncClient:
    handler = None

    def __init__(self, *args, **kwargs):
        pass

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc, tb):
        return False

    async def get(self, url: str, params=None, headers=None) -> httpx.Response:
        return DummyAsyncClient.handler(url, params)


@pytest.fixture
def mock_mangadex(monkeypatch: pytest.MonkeyPatch):
    monkeypatch.setattr(mangadex_controller.httpx, "AsyncClient", DummyAsyncClient)

    def _configure(handler):
        DummyAsyncClient.handler = handler

    return _configure


def test_search_manga_and_feed_endpoints(client: TestClient, mock_mangadex):
    manga_id = str(uuid4())

    def handler(url: str, params):
        req = httpx.Request("GET", url)
        if url.endswith("/manga"):
            return httpx.Response(200, json={"result": "ok", "data": [{"id": manga_id}]}, request=req)
        if url.endswith("/cover"):
            return httpx.Response(200, json={"result": "ok", "data": []}, request=req)
        if url.endswith(f"/manga/{manga_id}/feed"):
            return httpx.Response(200, json={"result": "ok", "total": 100}, request=req)
        return httpx.Response(404, json={"result": "error"}, request=req)

    mock_mangadex(handler)

    search_res = client.get("/api/mangadex/manga", params={"title": "One Piece"})
    assert search_res.status_code == 200
    assert search_res.json()["data"][0]["id"] == manga_id

    cover_res = client.get("/api/mangadex/cover", params={"manga_id": manga_id})
    assert cover_res.status_code == 200

    feed_res = client.get(f"/api/mangadex/manga/{manga_id}/feed")
    assert feed_res.status_code == 200
    assert feed_res.json()["total"] == 100


def test_cover_image_proxy_and_security_validation(
    client: TestClient,
    mock_mangadex,
    make_jpeg_bytes,
):
    manga_id = str(uuid4())
    sample_jpeg = make_jpeg_bytes(width=200, height=300)

    def handler(url: str, params):
        req = httpx.Request("GET", url)
        return httpx.Response(
            200,
            content=sample_jpeg,
            headers={"content-type": "image/jpeg"},
            request=req,
        )

    mock_mangadex(handler)

    valid_res = client.get(f"/api/mangadex/covers/{manga_id}/cover_t1.jpg")
    assert valid_res.status_code == 200
    assert valid_res.headers["content-type"].startswith("image/jpeg")
    assert valid_res.content == sample_jpeg

    invalid_filename = client.get(f"/api/mangadex/covers/{manga_id}/bad$name.jpg")
    assert invalid_filename.status_code == 400


def test_mangadex_timeout_returns_504(client: TestClient, mock_mangadex):
    def handler(url: str, params):
        raise httpx.TimeoutException("Timed out")

    mock_mangadex(handler)
    res = client.get("/api/mangadex/manga", params={"title": "Naruto"})
    assert res.status_code == 504