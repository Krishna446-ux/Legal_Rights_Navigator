import asyncio

from huggingface_hub import InferenceClient
from huggingface_hub.errors import HfHubHTTPError
from loguru import logger
import numpy as np

from graph.nodes.retrieve.retrieve_pgvector import retrive_pgvector
from enums.Domain import Domain
from graph.state import FullGraphState
from core.config import setting
from graph.node_types.metadata_filter import MetadataFilter
from ingestion_engine.models import LegalChunk


async def retrieve_chunks(
    state: FullGraphState,
    top_k: int = 5,
):
    try:
        client = InferenceClient(
            provider="hf-inference",
            api_key=setting.HF_TOKEN,
        )
        logger.debug("HuggingFace InferenceClient initialised for retrieval")
    except Exception as e:
        logger.exception(f"Failed to initialise HuggingFace InferenceClient: {e}")
        raise

    parts = [state.get("normalized_query")]

    working_memory = state.get("working_memory")
    if working_memory:
        parts.append(f"Known facts: {working_memory}")

    query_to_embed = "\n".join(part for part in parts if part)

    if not query_to_embed:
        logger.error("retrieve_chunks called with no query in state")
        raise ValueError("No query available for retrieval")

    logger.debug(f"Embedding query (length={len(query_to_embed)}): '{query_to_embed[:80]}'")

    embedding = None
    for attempt in range(1, 4):
        try:
            embedding = await asyncio.to_thread(
                client.feature_extraction,
                query_to_embed,
                model="BAAI/bge-m3",
            )
            logger.debug(f"Embedding obtained on attempt {attempt}")
            break

        except HfHubHTTPError as e:
            logger.warning(f"HuggingFace embedding attempt {attempt}/3 failed: {e}")
            if attempt == 3:
                logger.exception(f"All 3 embedding attempts exhausted: {e}")
                raise
            await asyncio.sleep(2 ** (attempt - 1))

        except Exception as e:
            logger.exception(f"Unexpected error during embedding on attempt {attempt}: {e}")
            raise

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
            query_embedding=embedding.tolist(),
            metadata_filter=metadata_filters,
            limit=top_k,
        )
        logger.info(f"PGVector returned {len(retrieved)} result(s)")
    except Exception as e:
        logger.exception(f"PGVector retrieval failed: {e}")
        raise

    return [chunk for chunk, _distance in retrieved]
