from typing import Literal
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlmodel import Session, delete, select

from controller.user_controller import get_current_user
from database import get_session
from model.history import History
from model.user import User

router = APIRouter(prefix="/api/user/history", tags=["history"])

class HistoryCreate(BaseModel):
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
        select(History).where(History.user_id == user.id).order_by(History.created_at.desc())
    ).all()
    return [entry.to_dict() for entry in entries]

@router.get("/{history_id}")
def get_history_entry(history_id: UUID, user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    entry = session.get(History, history_id)
    if entry is None or entry.user_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="History not found.",
        )
    return entry.to_dict()

@router.post("", status_code=status.HTTP_201_CREATED)
def add_history(data: HistoryCreate, user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    entry = History(user_id=user.id, **data.model_dump())
    session.add(entry)
    session.commit()
    session.refresh(entry)
    return entry.to_dict()

@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
def clear_history(user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    session.exec(delete(History).where(History.user_id == user.id))
    session.commit()
