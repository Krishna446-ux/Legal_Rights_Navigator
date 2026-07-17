from core.config import setting
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy.pool import NullPool

engine = create_async_engine(
    setting.database_url,
    echo=False,
    poolclass=NullPool,   # prevents "Future attached to a different loop" in async contexts
)# we can build connection or we create a session

AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)