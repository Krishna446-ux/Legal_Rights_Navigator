import asyncio
from core.config import setting
from sqlalchemy.ext.asyncio import create_async_engine,async_sessionmaker
from sqlalchemy import select

engine = create_async_engine(setting.database_url,echo=False,)

AsyncSessionLocal = async_sessionmaker(engine,expire_on_commit=False,)