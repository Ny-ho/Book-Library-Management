#used to create physical table ??? ig and not let run in same thread
# pyrefly: ignore [missing-import]
from sqlmodel import create_engine,Session
from app.config import settings

engine=create_engine(
    settings.DATABASE_URL,
    echo=True,
    connect_args={"check_same_thread":False}

)
def get_session():
    with Session(engine) as session:
        yield session