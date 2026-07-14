from typing import TypedDict
from enums.GateResult import GateResult

class Validity_Gate_Type(TypedDict):
    validity_result:GateResult|None
    gate_tier:int
    similarity_score:float|None
    # Type "dict[str, dict[str, GateResult | int | None]]"