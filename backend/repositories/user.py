from sqlalchemy.dialects.postgresql import insert

from core.db_session import AsyncSessionLocal as session
from models.user import User


async def insert_user_entry(name: str, email: str, sub: str):
    async with session() as db:
        try:
            stmt = (insert(User).values(
                    name=name,
                    email=email,
                    google_sub=sub,
                ).on_conflict_do_nothing(index_elements=["google_sub","email"])
            )

            await db.execute(stmt)
            await db.commit()

        except Exception:
            await db.rollback()
            raise