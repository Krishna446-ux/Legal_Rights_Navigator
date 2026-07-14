from enum import Enum

from pydantic import BaseModel
from ingestion_engine.models import ChunkMetadata

class RetrievedChunk(BaseModel):
    chunk_id: str
    text: str
    chunk_metadata: ChunkMetadata
    score: float
