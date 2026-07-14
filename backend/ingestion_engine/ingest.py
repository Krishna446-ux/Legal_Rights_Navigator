import yaml
from pathlib import Path
import requests
from core.db_session import AsyncSessionLocal
from models.legal_chunks import LegalChunk
from ingestion_engine.utility_function import download
from ingestion_engine.models import DocumentMetadata
from ingestion_engine.chunker import create_chunks_and_embed
from sqlalchemy.dialects.postgresql import insert
from loguru import logger
import asyncio


async def insert_chunk_into_database(final_chunks):
    """Persist a list of chunk dicts into the database inside a single transaction."""
    logger.info(f"Inserting {len(final_chunks)} chunks into the database.")
    if not final_chunks:
        logger.warning("No chunks provided to insert_chunk_into_database; skipping.")
        return

    async with AsyncSessionLocal() as db:
        try:
            for idx, chunk in enumerate(final_chunks):
                try:
                    db_chunk = LegalChunk(
                        text=chunk["text"],
                        embedding=chunk["embedding"],
                        chunk_metadata=chunk["chunk_metadata"],
                    )
                    db.add(db_chunk)
                except (KeyError, TypeError) as e:
                    logger.error(f"Malformed chunk at index {idx}, skipping: {e}")
                    continue

            await db.commit()
            logger.info("All chunks committed to the database successfully.")

        except Exception as e:
            logger.exception(f"Database error during chunk insertion, rolling back: {e}")
            await db.rollback()
            raise


async def main():
    BASE_DIR = Path(__file__).resolve().parent
    base_path = BASE_DIR / "domains"

    logger.info(f"Starting ingestion pipeline. Scanning domain folders under: {base_path}")

    try:
        folders = [item for item in base_path.iterdir() if item.is_dir()]
    except FileNotFoundError:
        logger.critical(f"Domains directory not found: {base_path}. Aborting.")
        return
    except PermissionError as e:
        logger.critical(f"Permission denied reading domains directory: {e}. Aborting.")
        return

    if not folders:
        logger.warning(f"No domain sub-folders found in '{base_path}'.")
        return

    logger.info(f"Found {len(folders)} domain folder(s): {[f.name for f in folders]}")

    for p in folders:
        yaml_path = Path(p, "sources.yaml")
        logger.info(f"Processing domain folder: '{p.name}'")

        try:
            with open(yaml_path, "r", encoding="utf-8") as f:
                data = yaml.safe_load(f)
        except FileNotFoundError:
            logger.error(f"sources.yaml not found in '{p}'. Skipping this domain.")
            continue
        except yaml.YAMLError as e:
            logger.error(f"Failed to parse YAML at '{yaml_path}': {e}. Skipping this domain.")
            continue
        except OSError as e:
            logger.error(f"OS error reading '{yaml_path}': {e}. Skipping this domain.")
            continue

        sources = data.get("sources", [])
        if not sources:
            logger.warning(f"No sources listed in '{yaml_path}'. Skipping this domain.")
            continue

        logger.info(f"Found {len(sources)} source(s) in '{p.name}'.")

        for d in sources:
            doc_title = d.get("document_title", "<unknown>")
            doc_url = d.get("url", "<no-url>")
            logger.info(f"Processing source: '{doc_title}' (url: {doc_url})")

            file_path = Path(p.resolve(), doc_title)

            try:
                PDF_SOURCE = None
                if not file_path.is_file():
                    logger.info(f"'{doc_title}' not found locally. Downloading from '{doc_url}'...")
                    try:
                        PDF_SOURCE = download(
                            url=doc_url,
                            filepath=p.resolve(),
                            file_title=doc_title,
                        )
                        logger.info(f"Downloaded '{doc_title}' to '{PDF_SOURCE}'.")
                    except requests.exceptions.Timeout:
                        logger.error(f"Download timed out for '{doc_url}'. Skipping '{doc_title}'.")
                        continue
                    except requests.exceptions.ConnectionError as e:
                        logger.error(f"Connection error while downloading '{doc_url}': {e}. Skipping.")
                        continue
                    except requests.exceptions.HTTPError as e:
                        logger.error(f"HTTP error while downloading '{doc_url}': {e}. Skipping.")
                        continue
                else:
                    PDF_SOURCE = file_path
                    logger.info(f"'{doc_title}' found locally at '{PDF_SOURCE}'.")

                try:
                    doc_metadata = DocumentMetadata(
                        document_title=d.get("document_title"),
                        document_type=d.get("document_type"),
                        issuing_authority=d.get("issuing_authority"),
                        jurisdictions=d.get("jurisdictions"),
                        date=d.get("date"),
                        domain=d.get("domain"),
                    )
                except Exception as e:
                    logger.error(f"Failed to build DocumentMetadata for '{doc_title}': {e}. Skipping.")
                    continue

                logger.info(f"Running chunking & embedding pipeline for '{doc_title}'...")
                try:
                    final_chunks = create_chunks_and_embed(str(PDF_SOURCE.resolve()), doc_metadata)
                except Exception as e:
                    logger.error(f"Chunking/embedding pipeline failed for '{doc_title}': {e}. Skipping.")
                    continue

                if not final_chunks:
                    logger.warning(f"No chunks produced for '{doc_title}'. Nothing to insert.")
                    continue

                logger.info(f"Inserting {len(final_chunks)} chunks for '{doc_title}' into the database...")
                try:
                    await insert_chunk_into_database(final_chunks)
                    logger.info(f"Successfully ingested '{doc_title}'.")
                except Exception as e:
                    logger.error(f"Database insertion failed for '{doc_title}': {e}. Continuing with next source.")
                    continue

            except Exception as e:
                logger.exception(f"Unexpected error during ingestion of '{doc_title}': {e}. Skipping.")
                continue

    logger.info("Ingestion pipeline finished.")


if __name__ == "__main__":
    asyncio.run(main())