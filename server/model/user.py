from datetime import datetime, timezone
from uuid import UUID, uuid4

from sqlmodel import Field, SQLModel

class User(SQLModel, table=True):
    __tablename__ = "users"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    email: str = Field(unique=True, index=True)
    password_hash: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            "id": str(self.id),
            "email": self.email,
            "created_at": self.created_at.isoformat(),
        }
