from enum import Enum


class AgentAction(str, Enum):
    ASK_CLARIFICATION = "ask_clarification"
    RETRIEVE = "retrieve"
    ANSWER = "answer"