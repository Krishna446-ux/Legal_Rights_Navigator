from loguru import logger
from graph.nodes.validity_gate.embeddings_filter import apply_tier2_rules
from graph.nodes.validity_gate.rules import apply_tier1_rules, GateResult
from graph.node_types.validity_node import Validity_Gate_Type
from graph.state import FullGraphState


def run_validity_gate(state: FullGraphState) -> Validity_Gate_Type:
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
            return {"validity_result": GateResult.REJECT, "gate_tier": 1, "similarity_score": None}

        # Tier 2 — embedding similarity filter
        tier2_result, similarity_score = apply_tier2_rules(query)
        logger.debug(f"Tier 2 result: {tier2_result}, similarity_score={similarity_score:.4f}")

        if tier2_result in (GateResult.PASS, GateResult.REJECT):
            logger.info(f"Query {'passed' if tier2_result == GateResult.PASS else 'rejected'} at Tier 2 (score={similarity_score:.4f})")
            return {"validity_result": tier2_result, "gate_tier": 2, "similarity_score": similarity_score}

        # Falls through to Tier 3 LLM gate
        logger.info(f"Query uncertain after Tier 2, escalating to Tier 3 (score={similarity_score:.4f})")
        return {"validity_result": GateResult.UNCERTAIN, "gate_tier": 2, "similarity_score": similarity_score}

    except Exception as e:
        logger.exception(f"Validity gate crashed unexpectedly: {e}")
        # Fail open with UNCERTAIN so Tier 3 can make the final call
        return {"validity_result": GateResult.UNCERTAIN, "gate_tier": 0, "similarity_score": None}
