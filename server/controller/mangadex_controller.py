import asyncio
import re
from uuid import UUID

import httpx
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import Response

router = APIRouter(prefix="/api/mangadex", tags=["mangadex"])

MANGADEX_API = "https://api.mangadex.org"
MANGADEX_COVERS = "https://uploads.mangadex.org/covers"
MANGADEX_HEADERS = {
    "User-Agent": "Manganitor/1.0.0 (+https://sae.sash1ro.fr)",
}
REQUEST_INTERVAL_SECONDS = 0.22

_request_lock = asyncio.Lock()
_next_request_at = 0.0
_cover_filename_pattern = re.compile(r"^[A-Za-z0-9._-]+$")


async def _wait_for_request_slot() -> None:
    global _next_request_at

    loop = asyncio.get_running_loop()
    async with _request_lock:
        now = loop.time()
        delay = _next_request_at - now
        if delay > 0:
            await asyncio.sleep(delay)
        _next_request_at = loop.time() + REQUEST_INTERVAL_SECONDS


def _upstream_error(response: httpx.Response) -> HTTPException:
    try:
        upstream_body = response.json()
    except ValueError:
        upstream_body = response.text[:1000]

    headers = {
        name: response.headers[name]
        for name in (
            "X-RateLimit-Limit",
            "X-RateLimit-Remaining",
            "X-RateLimit-Retry-After",
            "X-Request-ID",
        )
        if name in response.headers
    }

    status_code = response.status_code if response.status_code < 500 else 502
    return HTTPException(
        status_code=status_code,
        detail={
            "message": "MangaDex rejected or could not complete the request",
            "upstream_status": response.status_code,
            "upstream_response": upstream_body,
        },
        headers=headers or None,
    )


async def _get_json(path: str, params: list[tuple[str, str]]) -> dict:
    await _wait_for_request_slot()

    try:
        async with httpx.AsyncClient(timeout=httpx.Timeout(15.0, connect=5.0)) as client:
            response = await client.get(
                f"{MANGADEX_API}{path}",
                params=params,
                headers=MANGADEX_HEADERS,
            )
    except httpx.TimeoutException as error:
        raise HTTPException(status_code=504, detail="MangaDex request timed out") from error
    except httpx.RequestError as error:
        raise HTTPException(status_code=502, detail="Could not reach MangaDex") from error

    if not response.is_success:
        raise _upstream_error(response)

    return response.json()


@router.get("/manga")
async def search_manga(title: str = Query(min_length=1, max_length=200)):
    return await _get_json(
        "/manga",
        [
            ("title", title),
            ("includes[]", "author"),
            ("includes[]", "cover_art"),
            ("order[relevance]", "desc"),
            ("contentRating[]", "safe"),
            ("contentRating[]", "suggestive"),
            ("limit", "30"),
        ],
    )


@router.get("/cover")
async def get_manga_covers(manga_id: UUID):
    return await _get_json(
        "/cover",
        [
            ("manga[]", str(manga_id)),
            ("order[volume]", "asc"),
            ("limit", "100"),
        ],
    )


@router.get("/manga/{manga_id}/feed")
async def get_manga_feed(
    manga_id: UUID,
    limit: int = Query(default=500, ge=1, le=500),
    offset: int = Query(default=0, ge=0, le=9500),
):
    return await _get_json(
        f"/manga/{manga_id}/feed",
        [
            ("limit", str(limit)),
            ("offset", str(offset)),
            ("translatedLanguage[]", "en"),
            ("order[chapter]", "asc"),
        ],
    )


@router.get("/covers/{manga_id}/{filename}")
async def get_cover_image(manga_id: UUID, filename: str):
    if not _cover_filename_pattern.fullmatch(filename) or filename in {".", ".."}:
        raise HTTPException(status_code=400, detail="Invalid cover filename")

    await _wait_for_request_slot()
    try:
        async with httpx.AsyncClient(timeout=httpx.Timeout(20.0, connect=5.0)) as client:
            response = await client.get(
                f"{MANGADEX_COVERS}/{manga_id}/{filename}",
                headers=MANGADEX_HEADERS,
            )
    except httpx.TimeoutException as error:
        raise HTTPException(status_code=504, detail="MangaDex cover request timed out") from error
    except httpx.RequestError as error:
        raise HTTPException(status_code=502, detail="Could not reach MangaDex covers") from error

    if not response.is_success:
        raise _upstream_error(response)

    media_type = response.headers.get("content-type", "image/jpeg").split(";", 1)[0]
    if not media_type.startswith("image/"):
        raise HTTPException(status_code=502, detail="MangaDex returned a non-image cover")

    return Response(
        content=response.content,
        media_type=media_type,
        headers={"Cache-Control": "public, max-age=86400"},
    )
