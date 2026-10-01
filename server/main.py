import json
import uuid
from pathlib import Path
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

from config import (
    PENDING_DIR,
    PUBLIC_DIR,
    INDEX_FILE,
    VERSION_FILE,
    ALLOWED_IMAGE_EXTENSIONS,
    SERVER_HOST,
    SERVER_PORT,
)
from pipeline.update_index import run_batch_update
from database import init_db
from controller import user_controller, history_controller

app = FastAPI(title="Manga Recognition API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

PENDING_DIR.mkdir(parents=True, exist_ok=True)
PUBLIC_DIR.mkdir(parents=True, exist_ok=True)

init_db()
app.include_router(user_controller.router)
app.include_router(history_controller.router)

if not VERSION_FILE.exists():
    with open(VERSION_FILE, "w", encoding="utf-8") as f:
        json.dump({"version": 1}, f)

@app.post("/api/contributions", status_code=status.HTTP_201_CREATED)
async def submit_contribution(
    universe: str = Form(...),
    tome: str = Form(...),
    image: UploadFile = File(...),
):
    if not universe.strip() or not tome.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Universe et tome sont obligatoires.",
        )

    ext = Path(image.filename or "").suffix.lower()
    if ext not in ALLOWED_IMAGE_EXTENSIONS:
        ext = ".jpg"

    entry_id = str(uuid.uuid4())
    saved_image_name = f"{entry_id}{ext}"
    saved_image_path = PENDING_DIR / saved_image_name
    saved_meta_path = PENDING_DIR / f"{entry_id}.json"

    content = await image.read()
    with open(saved_image_path, "wb") as f:
        f.write(content)

    meta_data = {
        "id": entry_id,
        "universe": universe.strip(),
        "tome": tome.strip(),
        "image_name": saved_image_name,
    }
    with open(saved_meta_path, "w", encoding="utf-8") as f:
        json.dump(meta_data, f, ensure_ascii=False)

    return {"status": "success", "id": entry_id}

@app.get("/api/index/version")
async def get_index_version():
    if not VERSION_FILE.exists():
        return {"version": 1}
    with open(VERSION_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

@app.get("/api/index/download")
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

@app.post("/api/batch/run")
async def trigger_batch_update():
    count = run_batch_update()
    return {"status": "success", "processed_mangas": count}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=SERVER_HOST, port=SERVER_PORT, reload=True)