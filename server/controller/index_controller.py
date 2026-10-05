import json
import secrets

from fastapi import APIRouter, Depends, Header, HTTPException, status
from fastapi.responses import FileResponse

from config import BATCH_API_KEY, INDEX_FILE, VERSION_FILE
from pipeline.update_index import run_batch_update

router = APIRouter(prefix="/api", tags=["index"])

def verify_batch_key(x_batch_key: str = Header(default="")):
    if not BATCH_API_KEY or not secrets.compare_digest(x_batch_key.encode(), BATCH_API_KEY.encode()):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Clé batch invalide.",
        )

@router.get("/index/version")
async def get_index_version():
    if not VERSION_FILE.exists():
        return {"version": 1}
    with open(VERSION_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

@router.get("/index/download")
async def download_index():
    if not INDEX_FILE.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Aucun index disponible.",
        )
    return FileResponse(
        path=str(INDEX_FILE),
        media_type="application/json",
        filename="index_mangas.json",
    )

@router.post("/batch/run", dependencies=[Depends(verify_batch_key)])
async def trigger_batch_update():
    count = run_batch_update()
    return {"status": "success", "processed_mangas": count}
