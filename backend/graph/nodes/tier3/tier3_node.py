from graph.nodes.tier3.tier3_llm_gate import tier3_llm_gate
from graph.state import FullGraphState

async def tier3_node(state:FullGraphState):
    try:
        result=await tier3_llm_gate(state)
        return result
    except Exception as e:
        RuntimeError("Error Could Not classify if query is valid or note, Erro at tier_3 node {}",e)