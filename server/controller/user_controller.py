from datetime import datetime, timedelta, timezone
from uuid import UUID

import bcrypt
import jwt
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel
from sqlmodel import Session, select

from config import JWT_SECRET, JWT_ALGORITHM, JWT_EXPIRE_HOURS
from database import get_session
from model.user import User

router = APIRouter(prefix="/api/user", tags=["user"])
bearer = HTTPBearer()

class Credentials(BaseModel):
    email: str 
    password: str

class UserPublic(BaseModel):
    id: UUID
    email: str

class AuthResponse(BaseModel):
    user: UserPublic
    token: str

def create_token(user_id: UUID):
    payload = {
        "sub": str(user_id),
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRE_HOURS),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer),
    session: Session = Depends(get_session),
):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user = session.get(User, UUID(payload["sub"]))
    except (jwt.PyJWTError, KeyError, ValueError):
        user = None

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )
    return user

@router.post("/register", status_code=status.HTTP_201_CREATED, response_model=AuthResponse)
def register(data: Credentials, session: Session = Depends(get_session)):
    email = data.email.strip().lower()
    if session.exec(select(User).where(User.email == email)).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with that email already exists",
        )

    password_hash = bcrypt.hashpw(data.password.encode(), bcrypt.gensalt()).decode()
    user = User(email=email, password_hash=password_hash)
    
    session.add(user)
    session.commit()
    session.refresh(user)

    return {"user": user, "token": create_token(user.id)}

@router.post("/login", response_model=AuthResponse)
def login(data: Credentials, session: Session = Depends(get_session)):
    email = data.email.strip().lower()
    user = session.exec(select(User).where(User.email == email)).first()

    if user is None or not bcrypt.checkpw(data.password.encode(), user.password_hash.encode()):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    return {"user": user, "token": create_token(user.id)}

@router.get("/me", response_model=UserPublic)
def me(user: User = Depends(get_current_user)):
    return user
