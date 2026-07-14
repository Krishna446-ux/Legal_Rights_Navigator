import numpy as np
from loguru import logger
from sqlalchemy import or_, select

from enums.Domain import Domain
from models.legal_chunks import LegalChunk
from core.db_session import AsyncSessionLocal
from graph.node_types.metadata_filter import MetadataFilter


async def retrive_pgvector(
    query_embedding: list[float],
    metadata_filter: MetadataFilter | None = None,
    limit: int = 5,
):
    logger.debug(f"retrive_pgvector called with limit={limit}, metadata_filter={metadata_filter}")

    try:
        distance = LegalChunk.embedding.cosine_distance(query_embedding).label("distance")

        stmt = (
            select(LegalChunk, distance)
            .order_by(distance)
            .limit(limit)
        )

        if metadata_filter:
        #     if jurisdictions := metadata_filter.get("jurisdiction"):
        #         # Match a chunk tagged "central" OR "karnataka".
        #         jurisdiction_matches = [
        #             LegalChunk.chunk_metadata["jurisdiction"].contains([jurisdiction])
        #             for jurisdiction in jurisdictions
        #         ]
        #         stmt = stmt.where(or_(*jurisdiction_matches))  # * unpacks the list and or_ joins these statements with where
        #         logger.debug(f"Applied jurisdiction filter: {jurisdictions}")

        #     if document_type := metadata_filter.get("document_type"):
        #         stmt = stmt.where(
        #             LegalChunk.chunk_metadata["document_type"].as_string()
        #             == document_type
        #         )
        #         logger.debug(f"Applied document_type filter: {document_type}")

            if domain := metadata_filter.get("domain"):
                stmt = stmt.where(LegalChunk.chunk_metadata["domain"].as_string() == metadata_filter.get("domain"))
                logger.debug(f"Applied domain filter: {domain}")

        async with AsyncSessionLocal() as session:
            result = await session.execute(stmt)
            rows = result.all()
            logger.info(f"PGVector query completed — {len(rows)} row(s) retrieved")
            return rows

    except Exception as e:
        logger.exception(f"PGVector DB query failed: {e}")
        raise