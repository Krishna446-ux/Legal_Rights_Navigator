from typing import List, Literal

from pydantic import BaseModel
from datetime import date

class DocumentMetadata(BaseModel):
    document_title: str|None
    document_type: str|None
    issuing_authority: str|None
    date: date| None
    domain:Literal["labour"]
class ChunkMetadata(DocumentMetadata,BaseModel):
    chunk_type:str|None
    heading:str|None
    summary:str|None
    topics:list[str]=[]
class LegalChunk(BaseModel):
    text:str|None
    embedding:list[float]
    chunk_metadata:dict
    