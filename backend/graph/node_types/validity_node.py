from typing import TypedDict
from graph.nodes.validity_gate.rules import GateResult

class Validity_Gate_Type(TypedDict):
    validity_result:GateResult
    gate_tier:int
    similarity_score:float|None