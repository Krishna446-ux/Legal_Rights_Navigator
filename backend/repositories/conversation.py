from uuid import UUID

from sqlalchemy import Sequence, delete, select, update

from core.db_session import AsyncSessionLocal
from models.conversation import Conversation
async def create_conversation(user_id:UUID):
    async with AsyncSessionLocal() as db:
        conversation = Conversation(user_id=user_id)
        db.add(conversation)

        await db.commit()
        await db.refresh(conversation)

        return conversation.id

async def get_pg_conversation(user_id:UUID)->list[Conversation]:
    async with AsyncSessionLocal() as db:
        result=await db.execute(select(Conversation).where(Conversation.user_id == user_id))
        return list(result.scalars().all())
    
async def delete_pg_conversation(conversation_id:UUID):
    async with AsyncSessionLocal() as db:
        result=await db.execute(delete(Conversation).where(Conversation.id==conversation_id))
        await db.commit()
        return result.rowcount

async def rename_pg_conversation(conversation_id:UUID,title:str):
    async with AsyncSessionLocal() as db:
        result=await db.execute(update(Conversation).where(Conversation.id==conversation_id).values(title=title))
        await db.commit()
        return result.rowcount
    