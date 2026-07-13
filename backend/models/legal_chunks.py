import uuid
from datetime import datetime

from pgvector.sqlalchemy import Vector, VECTOR
from sqlalchemy import DateTime, Index, Text, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from core.database import Base


class LegalChunk(Base):
    __tablename__ = "legal_chunks"

    __table_args__ = (
        Index("ix_legal_chunk_metadata_gin", "chunk_metadata", postgresql_using="gin"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    text: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    embedding: Mapped[VECTOR] = mapped_column(
        Vector(1024),
        nullable=False,
    )

    chunk_metadata: Mapped[dict] = mapped_column(
        JSONB,
        nullable=False,
        default=dict,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )