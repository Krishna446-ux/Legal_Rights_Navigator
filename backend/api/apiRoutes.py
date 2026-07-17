from datetime import datetime
import logging
from uuid import UUID

from fastapi import APIRouter, HTTPException, Request, Response, status
from pydantic import BaseModel, ConfigDict

from api.models.StateRequest import StateRequest
from repositories.conversation import delete_pg_conversation, get_pg_conversation, rename_pg_conversation
from models.conversation import Conversation
from graph.state import FullGraphState
api_router = APIRouter(
    prefix="/api",
    tags=["api"]
)
class ConversationModel(BaseModel):
    id: UUID
    title: str
    user_id: UUID
    domain: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
def authorization_check(request: Request, user_id: UUID):
    user_info = getattr(request.state, "user_info", None)
    #print(user_info)

    if not user_info:
        return False
    return str(user_info.get("user_id")) == str(user_id)

def authentication_check(request: Request):
    user_info = getattr(request.state, "user_info", None)
    return user_info is not None

@api_router.post('/state')
def get_state(request:Request,body:StateRequest):
    # 1. Fixed the dictionary bracket syntax error
    is_auth=authorization_check(request,body.user_id)
    
    if not is_auth:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this resource to get conv id with this user_id"
        )
    config={
        "configurable":{"thread_id":body.conversation_id}
    }
    res=request.app.state.graph.get_state(config).values
    logging.info(res)
    return res

@api_router.get('/conversation',response_model=list[ConversationModel])
async def get_conversation(request: Request):
    user_info = getattr(request.state, "user_info", None)
    
    if not user_info:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )

    user_id = user_info.get("user_id")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token: missing user_id. Please log in again.",
        )

    try:
        result = await get_pg_conversation(UUID(str(user_id)))
        return result

    except Exception as e:
        logging.error("Could not get conversations: %s", e, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error while retrieving conversation from db",
        )
@api_router.delete('/conversation/{conversation_id}',response_model=int)
async def delete_conversation(conversation_id:UUID):
    return await delete_pg_conversation(conversation_id)

@api_router.put('/conversation/{conversation_id}/{title}')
async def rename_conversation(conversation_id:UUID,title:str):
    return await rename_pg_conversation(conversation_id,title)
    
@api_router.post('/logout')
def logout(response:Response):
    response.delete_cookie("jwt_token")
    return {"Message":"Cookie Deleted Succesfully"}
        
    
    
    

    

