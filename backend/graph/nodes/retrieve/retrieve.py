from loguru import logger

from enums.Domain import Domain
from enums.RetrievalStatus import RetrievalStatus
from graph.nodes.retrieve.retrieve_legal_chunks import retrieve_chunks
from graph.state import FullGraphState

from langchain_core.messages import AIMessage

async def retrieve(state: FullGraphState):
    query = state.get("refined_query") or state.get("normalized_query")
    if not query:
        messages = state.get("messages", [])
        query = messages[-1].content if messages else ""
    logger.info(f"Retrieve node invoked for query='{str(query)[:80]}'")

    try:
        chunks = await retrieve_chunks(state=state, query=query, top_k=5)
        logger.info(f"Retrieval succeeded — {len(chunks)} chunk(s) returned")

        return {
            "retrieved_chunks": chunks,
            "retrieval_status": RetrievalStatus.SUCCESS,
        }

    except Exception as e:
        logger.exception(f"Retrieval failed for query='{str(query)[:80]}': {e}")

        return {
            "retrieved_chunks": [],
            "retrieval_status": RetrievalStatus.ERROR,
            "messages": [
                AIMessage(
                    content="I could not access the legal knowledge base right now. Please try again shortly."
                )
            ],
        }
        

