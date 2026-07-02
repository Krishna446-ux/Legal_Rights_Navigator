import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
import secrets

DATABASE_URL = "postgresql+asyncpg://postgres:securepassword@localhost:5432/legalrights_db"

async def main():
    print(secrets.token_hex(32))
    engine = create_async_engine(DATABASE_URL)

    async with engine.connect() as conn:
        result = await conn.execute(text("SELECT 1"))
        print(result.scalar())

    await engine.dispose()

asyncio.run(main())