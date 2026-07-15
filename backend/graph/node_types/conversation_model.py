from pydantic import BaseModel

from enums.AgentAction import AgentAction


class ConversationDecision(BaseModel):
    action: AgentAction
    clarification_questions: list[str] = []
    refined_query: str | None = None
    answer: str | None = None
    updated_working_memory: str | None = None