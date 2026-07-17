
# idea is to filter the query
import asyncio
from enums.GateResult import GateResult
import json
import time
from services.get_embeddings import get_embedding
from pathlib import Path
from core.config import setting
import numpy as np
from numpy import ndarray
from huggingface_hub import InferenceClient
from graph.nodes.validity_gate.embeddings_store import IN_DOMAIN, OUT_DOMAIN
from loguru import logger

PASS_THRESHOLD = 0.65
REJECT_THRESHOLD = 0.35

try:
    logger.info("HuggingFace InferenceClient initialized successfully")
except Exception as e:
    logger.exception(f"Failed to initialize HuggingFace InferenceClient: {e}")
    raise


def cosine_similarity(v1: ndarray, v2: ndarray):
    """Calculates cosine similarity between two 1D vectors."""
    dot_product = np.dot(v1, v2)
    norm_v1 = np.linalg.norm(v1)
    norm_v2 = np.linalg.norm(v2)

    if norm_v1 == 0 or norm_v2 == 0:
        logger.warning("Zero-norm vector encountered in cosine_similarity — returning 0.0")
        return 0.0
    return float(dot_product / (norm_v1 * norm_v2))


IN_DOMAIN_EMBEDDING = Path('IN_DOMAIN_EMBEDDINGS.json')
OUT_DOMAIN_EMBEDDING = Path('OUT_DOMAIN_EMBEDDINGS.json')
async def apply_tier2_rules(query: str) -> tuple[GateResult, float]:
    logger.debug(f"Tier 2: computing embedding similarity for query='{query[:80]}'")
    try:
        loop = asyncio.get_running_loop()
        # SentenceTransformer.encode is CPU-bound — run in thread pool to avoid blocking event loop
        embedding = await loop.run_in_executor(None, get_embedding, query)
        query_embedding = np.array(embedding)
        
        max_in = max(cosine_similarity(query_embedding, item["embedding"]) for item in IN_DOMAIN)
        max_out = max(cosine_similarity(query_embedding, item["embedding"]) for item in OUT_DOMAIN)
        
        logger.debug(f"Tier 2 scores: max_in={max_in:.4f}, max_out={max_out:.4f}")

        if max_in > PASS_THRESHOLD and max_in > max_out:
            logger.info(f"Tier 2 PASS: max_in={max_in:.4f}")
            return (GateResult.PASS, float(max_in))
        elif max_in < REJECT_THRESHOLD:
            logger.info(f"Tier 2 REJECT: max_in={max_in:.4f} below threshold {REJECT_THRESHOLD}")
            return (GateResult.REJECT, float(max_in))

        logger.info(f"Tier 2 UNCERTAIN: max_in={max_in:.4f}")
        return (GateResult.UNCERTAIN, float(max_in))

    except Exception as e:
        logger.exception(f"Tier 2 embedding filter failed: {e}")
        return (GateResult.UNCERTAIN, 0.0)


async def main():
    print(await apply_tier2_rules("Seciton 43"))
    
if __name__=="__main__":
    asyncio.run(main())

