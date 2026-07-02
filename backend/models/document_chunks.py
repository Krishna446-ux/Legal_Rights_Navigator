import uuid
from datetime import datetime
from sqlalchemy import DateTime, String, Text, UniqueConstraint,func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column
from pgvector.sqlalchemy import Vector,VECTOR

from core.database import Base


class DocumentChunk(Base):
    __tablename__ = "document_chunks"
    
    __table_args__ = (

        UniqueConstraint(

            "domain",

            "source",

            "content",

            name="uq_document_chunk",

        ),

    )
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    domain: Mapped[str] = mapped_column(
        String,
        nullable=False,
    )

    source: Mapped[str | None] = mapped_column(
        String,
        nullable=True,
    )

    content: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    embedding: Mapped[VECTOR] = mapped_column(
        Vector(1024),
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )