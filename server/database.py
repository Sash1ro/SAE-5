from sqlmodel import SQLModel, Session, create_engine

from config import DATABASE_URL

engine = create_engine(DATABASE_URL)

def init_db():
    from model.user import User  
    from model.history import History
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session
