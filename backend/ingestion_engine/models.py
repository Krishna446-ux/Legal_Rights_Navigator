from typing import List, Literal

from pydantic import BaseModel
from datetime import date

class DocumentMetadata(BaseModel):
    document_title: str|None
    document_type: str|None
    issuing_authority: str|None
    date: date| None
    jurisdictions: list[str] = []  # ["central"], ["karnataka"]
    domain:Literal["family_womens_rights",
                   "cyber_crime",
                   "tenant_property",
                   "consumer_protection",
                   "labour_employment"]|None
class ChunkMetadata(DocumentMetadata):
    chunk_type:str|None
    heading:str|None
    summary:str|None
    topics:list[str]=[]
class LegalChunk(BaseModel):
    text:str|None
    embedding:list[float]
    chunk_metadata:ChunkMetadata
    