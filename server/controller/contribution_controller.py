import base64
import json
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlmodel import Session

from config import ALLOWED_IMAGE_EXTENSIONS, PENDING_DIR
from controller.user_controller import get_current_user
from database import get_session
from model.history import History
from model.user import User

router = APIRouter(prefix="/api/contributions", tags=["contributions"])

@router.post("", status_code=status.HTTP_201_CREATED)
async def submit_contribution(
    universe: str = Form(...),
    tome: str = Form(...),
    image: UploadFile = File(...),
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    if not universe.strip() or not tome.strip().isdigit() or int(tome) <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Universe and volume are required.",
        )

    ext = Path(image.filename or "").suffix.lower()
    if ext not in ALLOWED_IMAGE_EXTENSIONS:
        ext = ".jpg"

    entry_id = uuid.uuid4()
    saved_image_name = f"{entry_id}{ext}"

    content = await image.read()
    with open(PENDING_DIR / saved_image_name, "wb") as f:
        f.write(content)

    meta_data = {
        "id": str(entry_id),
        "universe": universe.strip(),
        "tome": tome.strip(),
        "image_name": saved_image_name,
    }
    with open(PENDING_DIR / f"{entry_id}.json", "w", encoding="utf-8") as f:
        json.dump(meta_data, f, ensure_ascii=False)

    session.add(History(
        id=entry_id,
        user_id=user.id,
        image_64=base64.b64encode(content).decode(),
        universe_name=universe.strip(),
        universe_volume=int(tome),
        ia_confidence=0,
        ia_similarity=0,
        history_result="success",
        history_type="contribution",
    ))
    session.commit()

    return {"status": "success", "id": str(entry_id)}
