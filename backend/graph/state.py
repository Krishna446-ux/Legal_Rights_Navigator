from datetime import datetime
from typing import Optional,Literal,TypedDict
from graph.nodes.validity_gate.rules import GateResult
from graph.node_types.validity_node import Validity_Gate_Type
from graph.enum.Domain import Domain
#What information does the next node need from the previous node?
# 

class FullGraphState(TypedDict, total=False):
    """Complete pipeline state"""
    # Input
    user_id: str
    conversation_id: str
    query: str
    timestamp: datetime

    # Validity Gate output
    is_valid: bool
    gate_tier_reached: int
    validity_node_result:Validity_Gate_Type

    # Domain Classification output
    domain: str
    domain_confidence: float

    # Clarification (optional)
    needs_clarification: bool
    clarification_question: str|None

    # Retrieval
    retrieved_chunks: list[dict]

    # Planning
    action_plan: dict

    # Error tracking
    errors: list[dict]  # [{stage, error_msg, provider_used, timestamp}, ...]