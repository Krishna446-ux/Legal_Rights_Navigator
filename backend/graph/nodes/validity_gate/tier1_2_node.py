from graph.nodes.validity_gate.validity_gate import run_validity_gate
from graph.state import FullGraphState
from loguru import logger
def tier1_2_node(state:FullGraphState):
    try:
        result=run_validity_gate(state)
        return result
    except Exception as e:
        logger.error("tier1_2 node is causing error,directing towards tier3",e)
    