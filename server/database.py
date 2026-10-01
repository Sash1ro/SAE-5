from sqlmodel import SQLModel, Session, create_engine

from config import DATABASE_URL

# SQLite temporaire : on remplacera DATABASE_URL par la vraie BDD du groupe
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {})

def init_db():
    # Importés ici pour que SQLModel connaisse les tables avant de les créer
    from model.user import User  # noqa: F401
    from model.scan import Scan  # noqa: F401
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session
