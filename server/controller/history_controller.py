from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlmodel import Session, delete, select

from controller.user_controller import get_current_user
from database import get_session
from model.scan import Scan
from model.user import User

router = APIRouter(prefix="/api/user/history", tags=["history"])

class ScanCreate(BaseModel):
    universe: str
    tome: str
    similarity: float
    confidence: float

@router.get("")
def get_history(user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    scans = session.exec(
        select(Scan).where(Scan.user_id == user.id).order_by(Scan.created_at.desc())
    ).all()
    return [scan.to_dict() for scan in scans]

@router.post("", status_code=status.HTTP_201_CREATED)
def add_scan(data: ScanCreate, user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    if not data.universe.strip() or not data.tome.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Universe et tome sont obligatoires.",
        )

    scan = Scan(
        user_id=user.id,
        universe=data.universe.strip(),
        tome=data.tome.strip(),
        similarity=data.similarity,
        confidence=data.confidence,
    )
    session.add(scan)
    session.commit()
    session.refresh(scan)
    return scan.to_dict()

@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
def clear_history(user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    session.exec(delete(Scan).where(Scan.user_id == user.id))
    session.commit()
