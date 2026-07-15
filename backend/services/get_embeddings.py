import time
import requests
from loguru import logger
from huggingface_hub import InferenceClient
from core.config import setting

OLLAMA_TUNNEL_URL = "http://localhost:11434"

try:
    client = InferenceClient(
        provider="hf-inference",
        api_key=setting.HF_TOKEN,
    )
    logger.info("HuggingFace InferenceClient initialised in get_embeddings")
except Exception as e:
    logger.exception(f"Failed to initialise HuggingFace InferenceClient: {e}")
    raise


def get_embedding(text: str) -> list[float]:
    # Attempt HuggingFace first (3 retries with exponential back-off)
    for attempt in range(3):
        try:
            embedding = client.feature_extraction(text, model="BAAI/bge-m3")
            logger.debug(f"HuggingFace embedding obtained on attempt {attempt + 1}")
            return embedding.tolist()
        except Exception as e:
            logger.warning(f"HuggingFace attempt {attempt + 1}/3 failed: {e}")
            if attempt < 2:
                time.sleep(2 ** attempt)

    # Fallback: local Ollama tunnel
    logger.warning("HuggingFace exhausted — falling back to Ollama tunnel")
    try:
        response = requests.post(
            f"{OLLAMA_TUNNEL_URL}/api/embed",
            json={"model": "bge-m3", "input": text},
            headers={"ngrok-skip-browser-warning": "true"},
            timeout=60,
        )
        response.raise_for_status()
        embedding = response.json()["embeddings"][0]
        logger.info("Ollama fallback embedding obtained successfully")
        return embedding
    except requests.exceptions.Timeout:
        logger.error("Ollama fallback request timed out")
        raise
    except requests.exceptions.ConnectionError as e:
        logger.error(f"Ollama fallback connection error: {e}")
        raise
    except requests.exceptions.HTTPError as e:
        logger.error(f"Ollama fallback HTTP error: {e}")
        raise
    except (KeyError, IndexError) as e:
        logger.error(f"Ollama fallback response malformed — missing 'embeddings[0]': {e}")
        raise
    except Exception as e:
        logger.exception(f"Ollama fallback failed unexpectedly: {e}")
        raise