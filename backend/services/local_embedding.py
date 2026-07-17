# import os
# os.environ["HF_HUB_OFFLINE"] = "1"

# from typing import List, overload
# from sentence_transformers import SentenceTransformer
# from loguru import logger

# try:
#     model = SentenceTransformer("BAAI/bge-m3", device="cpu", local_files_only=True)
#     logger.info("SentenceTransformer model 'BAAI/bge-m3' loaded successfully")
# except Exception as e:
#     logger.exception(f"Failed to load SentenceTransformer model: {e}")
#     raise

# @overload
# def get_embedding(text: str) -> list[float]: ...

# @overload
# def get_embedding(text: list[str]) -> list[list[float]]: ...

# def get_embedding(
#     text: str | list[str],
# ) -> list[float] | list[list[float]]:
#     try:
#         logger.debug(f"Generating embedding for input type={type(text).__name__}")
#         result = model.encode(
#             text,
#             normalize_embeddings=True
#         ).tolist()
#         logger.debug("Embedding generated successfully")
#         return result
#     except Exception as e:
#         logger.exception(f"Failed to generate embedding: {e}")
#         raise

# def main():
#     logger.info("Getting embedding for the given content using the local embedding model.")
#     text = "Get embedding for the given content using the embedding service."
#     try:
#         vector = get_embedding(text)
#         logger.info(f"Success! Vector length: {len(vector)}")
#         logger.debug(f"First 5 dimensions: {vector[:5]}")
#     except Exception as e:
#         logger.error(f"main() failed: {e}")

# if __name__ == "__main__":
#     main()