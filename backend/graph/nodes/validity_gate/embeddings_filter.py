
# idea is to filter the query
from graph.nodes.validity_gate.reference_queries import IN_DOMAIN_QUERIES, OUT_OF_DOMAIN_QUERIES
from graph.nodes.validity_gate.rules import GateResult
import json
from services.local_embedding import get_embedding
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
    client = InferenceClient(
        provider="hf-inference",
        api_key=setting.HF_TOKEN,
    )
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
    return dot_product / (norm_v1 * norm_v2)


def apply_tier2_rules(query: str) -> tuple[GateResult, float]:
    logger.debug(f"Tier 2: computing embedding similarity for query='{query[:80]}'")
    try:
        embedding = client.feature_extraction(
            query,
            model="BAAI/bge-m3",
        )
        query_embedding = np.array(embedding)

        max_in = max(cosine_similarity(query_embedding, item.embedding) for item in IN_DOMAIN)
        max_out = max(cosine_similarity(query_embedding, item.embedding) for item in OUT_DOMAIN)

        logger.debug(f"Tier 2 scores: max_in={max_in:.4f}, max_out={max_out:.4f}")

        if max_in > PASS_THRESHOLD and max_in > max_out:
            logger.info(f"Tier 2 PASS: max_in={max_in:.4f}")
            return (GateResult.PASS, max_in)
        elif max_in < REJECT_THRESHOLD:
            logger.info(f"Tier 2 REJECT: max_in={max_in:.4f} below threshold {REJECT_THRESHOLD}")
            return (GateResult.REJECT, max_in)

        logger.info(f"Tier 2 UNCERTAIN: max_in={max_in:.4f}")
        return (GateResult.UNCERTAIN, max_in)

    except Exception as e:
        logger.exception(f"Tier 2 embedding filter failed: {e}")
        return (GateResult.UNCERTAIN, 0.0)


IN_DOMAIN_EMBEDDING = Path('IN_DOMAIN_EMBEDDINGS.json')
OUT_DOMAIN_EMBEDDING = Path('OUT_DOMAIN_EMBEDDINGS.json')


def main():
    logger.info("Generating and saving domain embeddings")
    try:
        in_domain_vecs = get_embedding(IN_DOMAIN_QUERIES)
        out_domain_vecs = get_embedding(OUT_OF_DOMAIN_QUERIES)

        data = [
            {"text": text, "embedding": embedding}
            for text, embedding in zip(IN_DOMAIN_QUERIES, in_domain_vecs)
        ]
        with IN_DOMAIN_EMBEDDING.open("w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
        logger.info(f"IN_DOMAIN embeddings saved to {IN_DOMAIN_EMBEDDING}")

        data = [
            {"text": text, "embedding": embedding}
            for text, embedding in zip(OUT_OF_DOMAIN_QUERIES, out_domain_vecs)
        ]
        with OUT_DOMAIN_EMBEDDING.open("w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
        logger.info(f"OUT_DOMAIN embeddings saved to {OUT_DOMAIN_EMBEDDING}")

    except Exception as e:
        logger.exception(f"Failed to generate/save embeddings: {e}")
        raise


if __name__ == "__main__":
    main()