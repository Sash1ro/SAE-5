import json

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import PENDING_DIR, PUBLIC_DIR, VERSION_FILE, SERVER_HOST, SERVER_PORT
from database import init_db

from controller.user_controller import router as user_router
from controller.history_controller import router as history_router
from controller.contribution_controller import router as contribution_router
from controller.index_controller import router as index_router

app = FastAPI(title="Manganitor")

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
app.include_router(index_router)
app.include_router(user_router)
app.include_router(history_router)
app.include_router(contribution_router)

if not VERSION_FILE.exists():
    with open(VERSION_FILE, "w", encoding="utf-8") as f:
        json.dump({"version": 1}, f)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=SERVER_HOST, port=SERVER_PORT, reload=True)
