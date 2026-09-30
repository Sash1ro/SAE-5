import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
STORAGE_DIR = BASE_DIR / "storage"

PENDING_DIR = STORAGE_DIR / "pending"
PROCESSED_DIR = STORAGE_DIR / "processed"
PUBLIC_DIR = STORAGE_DIR / "public"

INDEX_FILE = PUBLIC_DIR / "index_mangas.json"
VERSION_FILE = PUBLIC_DIR / "version.json"

ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png"}

SERVER_HOST = os.getenv("SERVER_HOST", "0.0.0.0")
SERVER_PORT = int(os.getenv("SERVER_PORT", "8000"))