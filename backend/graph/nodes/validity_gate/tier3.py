from loguru import logger

from graph.nodes.validity_gate.tier3_llm_gate import tier3_llm_gate
from graph.state import FullGraphState
from graph.node_types.validity_node import Validity_Gate_Type


async def tier3_node(state: FullGraphState):
    query = state.get("query", "")
    logger.info(f"Tier 3 node invoked for query='{str(query)[:80]}'")
    try:
        result = await tier3_llm_gate(state)
        logger.info(f"Tier 3 node completed successfully: is_legal={result.is_legal}")
        return result
    except Exception as e:
        logger.exception(f"Tier 3 node failed to classify query='{str(query)[:80]}': {e}")
        raise RuntimeError(f"Could not classify if query is valid — error at tier3_node: {e}") from e