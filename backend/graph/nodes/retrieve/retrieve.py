from loguru import logger

from enums.Domain import Domain
from enums.RetrievalStatus import RetrievalStatus
from graph.nodes.retrieve.retrieve_legal_chunks import retrieve_chunks
from graph.state import FullGraphState

from langchain_core.messages import AIMessage

async def retrieve(state: FullGraphState):
    query = state.get("normalized_query", "")
    logger.info(f"Retrieve node invoked for query='{str(query)[:80]}'")

    try:
        chunks = await retrieve_chunks(state=state, top_k=5)
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
        

import asyncio


async def main():
    state: FullGraphState = {
        # Query updated to target the exact "Wages" definition and 50% cap rules in your text
        "normalized_query": "How is the 50% allowance threshold calculated under the definition of wages in Section 2(y)?", # type: ignore
        "domain": Domain.LABOUR,
        "jurisdiction": ["central"], 
        "document_type": None,
    }

    result = await retrieve(state)

    print("Status:", result["retrieval_status"])

    for chunk in result["retrieved_chunks"]:
        print("\n--- CHUNK ---")
        print(chunk.text[:300])
        print(chunk.chunk_metadata)
    print("Count:", len(result["retrieved_chunks"]))

    for chunk in result["retrieved_chunks"]:
        print(chunk.text[:200])
        print(chunk.chunk_metadata)

asyncio.run(main())