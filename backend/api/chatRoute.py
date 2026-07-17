from datetime import datetime
import logging
from uuid import UUID
from loguru import logger
from fastapi import APIRouter, HTTPException, Request, status
from pydantic import BaseModel
from repositories.conversation import create_conversation


router = APIRouter(
    prefix="/chat",
    tags=["chat"]
)

# Instantiate the global graph here to avoid circular imports.
# main.py will import this and initialize it with the checkpointer.


# Fixed UUID used by the health-check route so the checkpointer can
# accumulate messages across repeated hits to /graph_health.
_HEALTH_CHECK_THREAD_ID = UUID("00000000-0000-0000-0000-000000000001")

def authorization_check(request: Request, user_id: UUID):
    user_info = getattr(request.state, "user_info", None)

    if not user_info:
        return False

    return user_info.get("user_id") == user_id


def authentication_check(request: Request):
    user_info = getattr(request.state, "user_info", None)

    return user_info is not None

@router.get("/graph_health")
async def graph_health(request: Request, query: str):
    graph = request.app.state.graph
    return {
        "state": await graph.ainvoke(
            _HEALTH_CHECK_THREAD_ID,
            query,
        )
    }

class ChatRequest(BaseModel):
    message: str
    conversation_id: UUID | None = None  # None → first message, create a new conversation
    date: str
    max_retrievals: int = 2
    max_clarifications: int = 2

class CitationOut(BaseModel):
    id: str
    title: str
    section: str
    confidence: float
    summary: str
    excerpt: str
    jurisdiction: str | None = None

class ChatResponse(BaseModel):
    conversation_id: str
    answer: str
    citations: list[CitationOut]

@router.post("/", response_model=ChatResponse)
async def chat(request: Request, body: ChatRequest):
    is_authenticated=authentication_check(request)
    if not is_authenticated:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this resource"
        )
    
    # ── Resolve thread ID ────────────────────────────────────────────────────
    
    if not body.conversation_id:
        try:
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
            thread_id = await create_conversation(UUID(str(user_id)))
        except HTTPException:
            raise
        except Exception as e:
            logging.error("Error while inserting data: %s", e, exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error while creating conversation",
            )
    else: thread_id=body.conversation_id

    logger.info(f"POST /chat | thread_id={thread_id} | message='{body.message[:80]}'")

    # ── Run the LangGraph ────────────────────────────────────────────────────
    graph = request.app.state.graph
    state = await graph.ainvoke(
        thread_id, 
        body.message,
        body.date,
        max_retrievals=body.max_retrievals,
        max_clarifications=body.max_clarifications
    )

    # ── Extract answer ────────────────────────────────────────────────────────
    messages = state.get("messages", [])
    last_msg = messages[-1] if messages else None
    answer = last_msg.content if last_msg and hasattr(last_msg, "content") else "I was unable to generate a response."

    # ── Map retrieved_chunks → citations ─────────────────────────────────────
    citations = []
    for chunk in state.get("retrieved_chunks", []):
        meta = chunk.chunk_metadata
        citations.append(CitationOut(
            id=chunk.chunk_id,
            title=meta.document_title or "Statute Source",
            section=meta.heading or "",
            confidence=round(chunk.score, 4),
            summary=meta.summary or "",
            excerpt=chunk.text[:500] if chunk.text else "",
            jurisdiction=meta.jurisdictions[0] if meta.jurisdictions else None,
        ))

    return ChatResponse(
        conversation_id=str(thread_id),
        answer=answer,
        citations=citations,
    )
