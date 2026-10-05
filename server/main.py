import json

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import PENDING_DIR, PUBLIC_DIR, VERSION_FILE, SERVER_HOST, SERVER_PORT
from database import init_db
from controller import user_controller, history_controller, contribution_controller, index_controller

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
app.include_router(user_controller.router)
app.include_router(history_controller.router)
app.include_router(contribution_controller.router)
app.include_router(index_controller.router)

if not VERSION_FILE.exists():
    with open(VERSION_FILE, "w", encoding="utf-8") as f:
        json.dump({"version": 1}, f)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=SERVER_HOST, port=SERVER_PORT, reload=True)
