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

DATABASE_URL = os.getenv("DATABASE_URL", "")
BATCH_API_KEY = os.getenv("BATCH_API_KEY", "")

JWT_SECRET = os.getenv("JWT_SECRET", "dev-secret-a-changer-en-production-0123456789")
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_HOURS = 24 * 7