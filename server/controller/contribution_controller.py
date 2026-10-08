import base64
import json
from pathlib import Path
from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, File, Form, UploadFile, status
from pydantic import BaseModel
from sqlmodel import Session

from config import ALLOWED_IMAGE_EXTENSIONS, PENDING_DIR
from controller.user_controller import get_current_user
from database import get_session
from model.history import History
from model.user import User

router = APIRouter(prefix="/api/contributions", tags=["contributions"])

class ContributionResponse(BaseModel):
    status: str
    id: UUID

@router.post("", status_code=status.HTTP_201_CREATED, response_model=ContributionResponse)
async def submit_contribution(
    universe_volume: int = Form(..., ge=1),
    universe_name: str = Form(..., min_length=1),
    image: UploadFile = File(...),
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    universe_name= universe_name.strip()

    ext = Path(image.filename or "").suffix.lower()
    if ext not in ALLOWED_IMAGE_EXTENSIONS:
        ext = ".jpg"

    entry_id = uuid4()
    saved_image_name = f"{entry_id}{ext}"

    content = await image.read()

    with open(PENDING_DIR / saved_image_name, "wb") as f:
        f.write(content)

    meta_data = {
        "id": str(entry_id),
        "universe": universe_name,
        "tome": universe_volume,
        "image_name": saved_image_name,
    }
    
    with open(PENDING_DIR / f"{entry_id}.json", "w", encoding="utf-8") as f:
        json.dump(meta_data, f, ensure_ascii=False)

    entry = History(
        user_id=user.id,
        image_64=base64.b64encode(content).decode(),
        universe_name=universe_name,
        universe_volume=float(universe_volume), 
        ia_confidence=0.0,
        ia_similarity=0.0,
        history_result="success",
        history_type="contribution",
    )
    
    session.add(entry)
    session.commit()
    session.refresh(entry)

    return {"status": "success", "id": entry_id}
