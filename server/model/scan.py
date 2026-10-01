from datetime import datetime
from typing import Optional

from sqlmodel import Field, SQLModel

class Scan(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    universe: str
    tome: str
    similarity: float
    confidence: float
    created_at: datetime = Field(default_factory=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "universe": self.universe,
            "tome": self.tome,
            "similarity": self.similarity,
            "confidence": self.confidence,
            "created_at": self.created_at.isoformat(),
        }
