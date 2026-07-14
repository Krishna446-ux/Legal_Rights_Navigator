from datetime import datetime
from typing import Annotated, Optional,Literal,TypedDict

from langgraph.graph import add_messages
from pydantic import BaseModel
from enums.RetrievalStatus import RetrievalStatus
from enums.Query_Type import QueryType

from graph.node_types.validity_node import Validity_Gate_Type
from enums.Domain import Domain
from graph.node_types.graph_states_types import RetrievedChunk
from langchain_core.messages import (
    BaseMessage
)
#What information does the next node need from the previous node?
# 
class ConversationContext(BaseModel):
    summary: str = ""
    jurisdiction: str | None = None
    issue: str | None = None
    employment_type: str | None = None
    requested_document_type: str | None = None
    
class FullGraphState(TypedDict, total=False):
    # Context
    conversation_id: str
    messages: Annotated[list[BaseMessage],add_messages]

    # Conversation Context
    working_memory:str# will used for embedding and retrieval
    normalized_query:str
    jurisdiction: list[str]|None #metadata
    employment_type: str | None #metadata
    document_type: Literal[
        "act",
        "rule",
        "notification",
        "scheme",
        "guidance",
    ]|None #metadata
    domain:Domain
    # Validity
    validity: Validity_Gate_Type | None

    # Classification
    query_type: QueryType | None
    needs_clarification: bool
    clarification_question:str
    
    # Retrieval
    retrieved_chunks: list[RetrievedChunk]
    retrieval_status: RetrievalStatus
    
    # Tool outputs
    tool_results: dict

    # Final answer
    response: str | None