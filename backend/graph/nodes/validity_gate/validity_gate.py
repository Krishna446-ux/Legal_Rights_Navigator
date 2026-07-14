from loguru import logger
from graph.nodes.validity_gate.embeddings_filter import apply_tier2_rules
from graph.nodes.validity_gate.rules import apply_tier1_rules, GateResult
from graph.node_types.validity_node import Validity_Gate_Type
from graph.state import FullGraphState
from graph.nodes.validity_gate.tier3 import tier3_node

async def run_validity_gate(state: FullGraphState):
    """Orchestrates Tier 1 -> Tier 2 -> (Tier 3 stub) validity checking.
    Returns a dict for use as LangGraph state update.
    """
    query = state["query"]  # type: ignore
    logger.info(f"Running validity gate for query='{query[:80]}...'")

    try:
        # Tier 1 — fast regex/keyword filter
        tier1_result = apply_tier1_rules(query)
        logger.debug(f"Tier 1 result: {tier1_result}")

        if tier1_result == GateResult.REJECT:
            logger.info("Query rejected at Tier 1")
            return {"validity":{"validity_result": GateResult.REJECT, "gate_tier": 1, "similarity_score": None}}

        # Tier 2 — embedding similarity filter
        tier2_result, similarity_score = apply_tier2_rules(query)
        logger.debug(f"Tier 2 result: {tier2_result}, similarity_score={similarity_score:.4f}")

        if tier2_result in (GateResult.PASS, GateResult.REJECT):
            logger.info(f"Query {'passed' if tier2_result == GateResult.PASS else 'rejected'} at Tier 2 (score={similarity_score:.4f})")
            return {"validity":{"validity_result": tier2_result, "gate_tier": 2, "similarity_score": similarity_score}}
        tier3_result=await tier3_node(state)

        # Falls through to Tier 3 LLM gate
        logger.info(f"Query uncertain after Tier 2, escalating to Tier 3 (score={similarity_score:.4f})")
        return {"validity":{"validity_result": tier3_result["is_legal"], "gate_tier": 3, "similarity_score": tier3_result["is_legal_confidence"]}} # type: ignore

    except Exception as e:
        logger.exception(f"Validity gate crashed unexpectedly: {e}")
        # Fail open with UNCERTAIN so Tier 3 can make the final call
        return {"validity":{"validity_result": GateResult.UNCERTAIN, "gate_tier": 0, "similarity_score": None}} 
# class GateResult(str, Enum):
# PASS = "pass"
# REJECT = "reject"
# UNCERTAIN = "uncertain"
# class Validity_Gate_Type(TypedDict):
#     validity_result:GateResult
#     gate_tier:int
#     similarity_score:float|None
# tier 3 results{
#   "is_legal": true or false,
#   "is_legal_confidence": 0.0 to 1.0,
#   "domain": "labour_employment" | "consumer_protection" | "tenant_property" | "cyber_crime" | "family_womens_rights" | "other_legal" | null,
#   "domain_confidence": 0.0 to 1.0,
#   "needs_clarification": true or false,
#   "reasoning": "one sentence explanation covering both the legality and domain decision"
# }