from datetime import datetime
from typing import Literal
from uuid import UUID

from langchain_core.messages import HumanMessage
from core.config import setting
from enums.AgentAction import AgentAction
from enums.RetrievalStatus import RetrievalStatus
from graph.state import FullGraphState
from langgraph.graph import StateGraph, START,END
from graph.nodes.validity_gate.validity_gate import run_validity_gate
from enums.GateResult import GateResult
from graph.nodes.retrieve.retrieve import retrieve
from graph.nodes.conversation.conversation_understanding import conversation_understanding



# conversation_id=123456


# graph.invoke(
#     input,
#     config={
#         "configurable": {
#             "thread_id": conversation_id
#         }
#     }
# )
class LangGraph:
    
        
    def route_after_validation(self,state:FullGraphState):
        if state["validity"]["validity_result"]==GateResult.PASS: 
            return "pass"
        return "reject"
    def route_after_retrieval(
        self,state: FullGraphState,
    ) -> Literal["success", "fail", "error"]:

        status = state.get("retrieval_status")

        if status == RetrievalStatus.SUCCESS:
            return "success"

        if status == RetrievalStatus.FAIL:
            return "fail"

        return "error"

    def route_after_understanding(self,state:FullGraphState):
        action = state.get("next_action")
        count = state.get("retrieval_count", 0)
        max_ret = state.get("max_retrievals", 2)
        from loguru import logger
        logger.info(f"route_after_understanding evaluating: action='{action}', count={count}, type(action)={type(action)}")
        
        if action:
            if action == AgentAction.RETRIEVE or str(action) == "retrieve" or str(action) == "AgentAction.RETRIEVE":
                if count <= max_ret:
                    return "retrieve"
                    
        return "pass"
    
    def __init__(self,checkpointer):
        graph_builder=StateGraph(FullGraphState)
        graph_builder.add_node("run_validity_gate", run_validity_gate)
        graph_builder.add_node("retrieve", retrieve)
        graph_builder.add_node("conversation_understanding", conversation_understanding)
        graph_builder.add_edge(START,"run_validity_gate")
        graph_builder.add_conditional_edges("run_validity_gate",self.route_after_validation,{
            "pass":"retrieve",
            "reject":END
        })

        graph_builder.add_conditional_edges("retrieve", self.route_after_retrieval,
            {
                "success": "conversation_understanding",
                "fail": "conversation_understanding",  # Agent can ask clarification/refine retrieval
                "error": END,                  # Error message was already added
            },)

        graph_builder.add_conditional_edges("conversation_understanding",self.route_after_understanding,{
            "pass":END,
            "retrieve":"retrieve",
        })

        self.graph = graph_builder.compile(
            checkpointer=checkpointer
        )

    async def ainvoke(self, conversation_id: UUID, message: str, date: str, max_retrievals: int = 2, max_clarifications: int = 2) -> FullGraphState:
        """Async version of invoke — required when called from async FastAPI endpoints."""
        result = await self.graph.ainvoke(
            {
                "messages": [HumanMessage(content=message,additional_kwargs={
                    "created_at": date})],
                "max_retrievals": max_retrievals,
                "max_clarifications": max_clarifications,
            },
            config={"configurable": {"thread_id": conversation_id}},
            
        )
        return result
    
    def get_state(self,config):
        return self.graph.get_state(config)