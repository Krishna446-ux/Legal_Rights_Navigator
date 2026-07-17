from uuid import UUID

from pydantic import BaseModel

class StateRequest(BaseModel):
    user_id:UUID
    conversation_id:UUID
    