from loguru import logger
from sqlalchemy import case, or_, select
import numpy as np
from models.legal_chunks import LegalChunk
from core.db_session import AsyncSessionLocal
from graph.node_types.metadata_filter import MetadataFilter

DISTANCE_THRESHOLD = 0.5

_KEYWORD_TO_CHUNK_TYPES: dict[str, list[str]] = {
    "penalty":    ["penalty", "obligation"],
    "fine":       ["penalty"],
    "right":      ["right", "obligation"],
    "eligible":   ["eligibility", "right"],
    "procedure":  ["procedure"],
    "how to":     ["procedure"],
    "definition": ["definition"],
    "exception":  ["exception"],
    "obligation": ["obligation"],
}


def _preferred_chunk_types(query: str | None) -> list[str]:
    if not query:
        return []
    q = query.lower()
    for keyword, types in _KEYWORD_TO_CHUNK_TYPES.items():
        if keyword in q:
            return types
    return []


async def retrive_pgvector(
    query_embedding: list[float],
    metadata_filter: MetadataFilter | None = None,
    limit: int = 5,
    normalized_query: str | None = None,
) -> list:
    try:
        distance = LegalChunk.embedding.cosine_distance(query_embedding).label("distance")

        preferred = _preferred_chunk_types(normalized_query)
        if preferred:
            chunk_type_col = LegalChunk.chunk_metadata["chunk_type"].as_string()
            # SQLAlchemy 2.0 case() takes (condition, result) tuples — dict form was removed.
            # CASE
            # WHEN chunk_type='penalty' THEN 0
            # WHEN chunk_type='obligation' THEN 0
            # ELSE 1
            # END
            priority = case(
                *[(chunk_type_col == ct, 0) for ct in preferred],
                else_=1,
            ).label("chunk_priority")
            base = (
                select(LegalChunk, distance)
                .where(distance <= DISTANCE_THRESHOLD)
                .order_by(priority, distance)
                .limit(limit)
            )
        else:
            base = (
                select(LegalChunk, distance)
                .where(distance <= DISTANCE_THRESHOLD)
                .order_by(distance)
                .limit(limit)
            )

        def apply_filters(stmt, f: MetadataFilter | None):
            if not f:
                return stmt
            if jurisdictions := f.get("jurisdiction"):
                stmt = stmt.where(or_(
                    *[LegalChunk.chunk_metadata["jurisdictions"].contains([j]) for j in jurisdictions]
                ))
            if doc_type := f.get("document_type"):
                stmt = stmt.where(LegalChunk.chunk_metadata["document_type"].as_string() == doc_type)
            if domain := f.get("domain"):
                stmt = stmt.where(
                    LegalChunk.chunk_metadata["domain"].as_string() == (domain.value if hasattr(domain, "value") else str(domain))
                )
            return stmt

        async with AsyncSessionLocal() as session:
            # Attempt 1: full filters
            rows = (await session.execute(apply_filters(base, metadata_filter))).all()
            if rows:
                return rows

            # Attempt 2: domain only
            if metadata_filter and (
                metadata_filter.get("jurisdiction")
                or metadata_filter.get("document_type")
            ):
                logger.warning("No results with full filters — retrying with domain only")

                domain_only: MetadataFilter = (
                    {"domain": metadata_filter["domain"]}
                    if metadata_filter.get("domain")
                    else {}
                )

                rows = (await session.execute(apply_filters(base, domain_only or None))).all()
                if rows:
                    return rows

            # Attempt 3: pure semantic
            if metadata_filter:
                logger.warning("No results with domain filter — falling back to pure semantic search")

            return (await session.execute(base)).all()
    except Exception as e:
        logger.exception(f"PGVector query failed: {e}")
        raise