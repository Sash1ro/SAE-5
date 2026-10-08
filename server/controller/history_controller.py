from typing import Literal
from uuid import UUID
import base64

from fastapi import APIRouter, Depends, HTTPException, status, Form, UploadFile, File
from pydantic import BaseModel, Field
from sqlmodel import Session, delete, select

from controller.user_controller import get_current_user
from database import get_session
from model.history import History
from model.user import User

router = APIRouter(prefix="/api/user/history", tags=["history"])

class HistoryData(BaseModel):
    image_64: str
    universe_name: str
    universe_volume: float = Field(ge=0)
    ia_confidence: float = Field(ge=0, le=1)
    ia_similarity: float = Field(ge=0, le=1)
    history_result: Literal["failed", "success"]
    history_type: Literal["detection", "contribution"]

@router.get("")
def get_history(user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    entries = session.exec(
        select(History)
        .where(History.user_id == user.id)
        .order_by(History.created_at.desc())
    ).all()
    return entries 

@router.get("/{history_id}")
def get_history_entry(history_id: UUID, user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    entry = session.get(History, history_id)
    if entry is None or entry.user_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="History not found.",
        )
    return entry

@router.delete("/{history_id}")
def delete_history_entry(history_id: UUID, user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    entry = session.get(History, history_id)
    if entry is None or entry.user_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="History not found.",
        )
    session.delete(entry)  
    session.commit()
    return entry

@router.post("", status_code=status.HTTP_201_CREATED)
async def add_history(image: UploadFile = File(...),
    universe_name: str = Form(..., min_length=1),
    universe_volume: float = Form(..., ge=0),
    ia_confidence: float = Form(..., ge=0, le=1),
    ia_similarity: float = Form(..., ge=0, le=1),
    history_result: Literal["failed", "success"] = Form(...),
    history_type: Literal["detection", "contribution"] = Form(...),
    user: User = Depends(get_current_user), session: Session = Depends(get_session)):

    content = await image.read()
    image64 = base64.b64encode(content).decode()

    entry = History(
        user_id=user.id,
        image_64=image64,
        universe_name=universe_name.strip(),
        universe_volume=universe_volume,
        ia_confidence=ia_confidence,
        ia_similarity=ia_similarity,
        history_result=history_result,
        history_type=history_type,
    )

    session.add(entry)
    session.commit()
    session.refresh(entry)
    return entry

@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
def clear_history(user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    session.exec(delete(History).where(History.user_id == user.id))
    session.commit()
