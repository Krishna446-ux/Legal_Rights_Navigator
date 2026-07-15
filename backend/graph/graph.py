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

max_retrieval=2

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
        if action:=state.get("next_action"):
            if action==AgentAction.RETRIEVE:
                if state.get("retrieval_count",0) <= max_retrieval:
                    return "retrieve"
                
                    
        return "pass"
    
    def initialize(self,checkpointer):
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
        
    def invoke(self, conversation_id: UUID, message: str, max_retrieval=2) -> FullGraphState:
        result = self.graph.invoke(
            {
                "messages": [HumanMessage(content=message)],
                "max_retrievals": max_retrieval,
            },
            config={"configurable": {"thread_id": conversation_id}},
        )
        return result

    async def ainvoke(self, conversation_id: UUID, message: str, max_retrieval=2) -> FullGraphState:
        """Async version of invoke — required when called from async FastAPI endpoints."""
        result = await self.graph.ainvoke(
            {
                "messages": [HumanMessage(content=message)],
                "max_retrievals": max_retrieval,
            },
            config={"configurable": {"thread_id": conversation_id}},
        )
        return result