from enum import Enum


class QueryType(str, Enum):
    RETRIEVE = "retrieve"
    CLARIFY = "clarify"
    CHAT = "chat"