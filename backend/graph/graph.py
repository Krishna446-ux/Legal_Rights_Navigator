from typing import Literal

from enums.RetrievalStatus import RetrievalStatus
from graph.state import FullGraphState
from langgraph.graph import StateGraph, START,END
from graph.nodes.validity_gate.validity_gate import run_validity_gate
from enums.GateResult import GateResult
from graph.nodes.retrieve.retrieve import retrieve
def validity_condtional(state:FullGraphState):
    if state["validity"]["validity_result"]==GateResult.PASS: # type: ignore
        return "pass"
    return "reject"
def route_after_retrieval(
    state: FullGraphState,
) -> Literal["success", "fail", "error"]:

    status = state.get("retrieval_status")

    if status == RetrievalStatus.SUCCESS:
        return "success"

    if status == RetrievalStatus.FAIL:
        return "fail"

    return "error"
graph_builder=StateGraph(FullGraphState)
graph_builder.add_edge(START,"run_validity_gate")
graph_builder.add_conditional_edges("run_validity_gate",validity_condtional,{
    "pass":"retrieve",
    "reject":END
})

graph_builder.add_conditional_edges("retrieve", route_after_retrieval,
    {
        "success": "conversation_agent",
        "fail": "conversation_agent",  # Agent can ask clarification/refine retrieval
        "error": END,                  # Error message was already added
    },)


