import asyncio

from huggingface_hub import InferenceClient
from huggingface_hub.errors import HfHubHTTPError
from loguru import logger
import numpy as np

from services.get_embeddings import get_embedding
from graph.nodes.retrieve.retrieve_pgvector import retrive_pgvector
from enums.Domain import Domain
from graph.state import FullGraphState
from core.config import setting
from graph.node_types.metadata_filter import MetadataFilter
from graph.node_types.graph_states_types import RetrievedChunk  # Pydantic model — msgpack-safe
from ingestion_engine.models import ChunkMetadata


async def retrieve_chunks(state: FullGraphState, query: str, top_k: int = 5):
    
    query_to_embed = query

    if not query_to_embed:
        logger.error("retrieve_chunks called with no query in state")
        raise ValueError("No query available for retrieval")

    logger.debug(f"Embedding query (length={len(query_to_embed)}): '{query_to_embed[:80]}'")

    loop = asyncio.get_running_loop()
    # get_embedding is CPU-bound (SentenceTransformer) — offload to thread pool
    embedding = await loop.run_in_executor(None, get_embedding, query_to_embed)
    

    if embedding is None:
        logger.error("Embedding is None after retry loop — this should not happen")
        raise RuntimeError("Failed to obtain embedding after retries")

    metadata_filters: MetadataFilter = {}

    domain = state.get("domain")
    if domain:
        metadata_filters["domain"] = domain

    jurisdiction = state.get("jurisdiction")
    if jurisdiction:
        metadata_filters["jurisdiction"] = jurisdiction

    document_type = state.get("requested_document_type")
    if document_type:
        metadata_filters["document_type"] = document_type

    logger.debug(f"Querying PGVector with metadata_filters={metadata_filters}, top_k={top_k}")

    try:
        retrieved = await retrive_pgvector(
            query_embedding=embedding,
            metadata_filter=metadata_filters,
            limit=top_k,
            normalized_query=query_to_embed,   # Priority 4: chunk_type soft ordering
        )
        logger.info(f"PGVector returned {len(retrieved)} result(s)")
    except Exception as e:
        logger.exception(f"PGVector retrieval failed: {e}")
        raise

    import json

    def _strip_numpy(obj):
        """Force object through JSON to strip numpy types for msgpack."""
        def default(o):
            if hasattr(o, "item"): return o.item()
            if hasattr(o, "tolist"): return o.tolist()
            raise TypeError
        data = obj if isinstance(obj, dict) else obj.model_dump()
        return json.loads(json.dumps(data, default=default))

    result: list[RetrievedChunk] = []
    for chunk, distance in retrieved:
        clean_meta = _strip_numpy(chunk.chunk_metadata)
        safe_meta = ChunkMetadata.model_validate(clean_meta)
        
        result.append(
            RetrievedChunk(
                chunk_id=str(chunk.id),
                text=str(chunk.text) if chunk.text else "",
                chunk_metadata=safe_meta,
                score=1.0 - float(distance),
            )
        )
    return result

