from sqlalchemy.dialects.postgresql import insert
from loguru import logger
from core.db_session import AsyncSessionLocal as session
from models.user import User


async def insert_user_entry(name: str, email: str, sub: str):
    logger.debug(f"Upserting user: email={email}, sub={sub}")
    async with session() as db:
        try:
            stmt = (
                insert(User)
                .values(
                    name=name,
                    email=email,
                    google_sub=sub,
                )
                .on_conflict_do_nothing(index_elements=["google_sub", "email"])
            )
            await db.execute(stmt)
            await db.commit()
            logger.info(f"User upserted successfully: email={email}")
        except Exception as e:
            await db.rollback()
            logger.exception(f"DB error while upserting user email={email}: {e}")
            raise