from datetime import datetime, timezone
from uuid import UUID, uuid4

from sqlmodel import Field, SQLModel

class History(SQLModel, table=True):
    __tablename__ = "history"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="users.id", index=True)
    image_64: str
    universe_name: str
    universe_volume: float
    ia_confidence: float
    ia_similarity: float
    history_result: str
    history_type: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            "id": str(self.id),
            "image_64": self.image_64,
            "universe_name": self.universe_name,
            "universe_volume": self.universe_volume,
            "ia_confidence": self.ia_confidence,
            "ia_similarity": self.ia_similarity,
            "history_result": self.history_result,
            "history_type": self.history_type,
            "created_at": self.created_at.isoformat(),
        }
