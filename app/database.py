#used to create physical table ??? ig and not let run in same thread
# pyrefly: ignore [missing-import]
#from sqlmodel import create_engine,Session
from app.config import settings
from sqlalchemy.ext.asyncio import create_async_engine
from sqlmodel.ext.asyncio.session import AsyncSession
#things like exec() which only works with sql model not with sql alchemy . sqlalchemy is board and expects execute()

engine=create_async_engine(
    settings.DATABASE_URL,
    echo=True,
    # connect_args={"check_same_thread":False}

)
async def get_session():
    async with AsyncSession(engine) as session:
        yield session#returns session to whoever endpoint requested it