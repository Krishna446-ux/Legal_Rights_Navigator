import json
from loguru import logger

IN_DOMAIN = {}
OUT_DOMAIN = {}

try:
    with open("IN_DOMAIN_EMBEDDINGS.json") as f:
        IN_DOMAIN = json.load(f)
    with open("OUT_DOMAIN_EMBEDDINGS.json") as f:
        OUT_DOMAIN = json.load(f)
    logger.info("Domain embedding stores loaded successfully")
except FileNotFoundError as e:
    logger.error(f"Embedding file not found: {e}")
    raise RuntimeError(f"Failed to load embeddings: {e}")
except json.JSONDecodeError as e:
    logger.error(f"Embedding file is not valid JSON: {e}")
    raise RuntimeError(f"Failed to load embeddings: {e}")
except Exception as e:
    logger.exception(f"Unexpected error loading embeddings: {e}")
    raise RuntimeError(f"Failed to load embeddings: {e}")