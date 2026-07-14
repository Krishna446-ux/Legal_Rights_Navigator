from pathlib import Path

import requests
from ingestion_engine.models import DocumentMetadata, ChunkMetadata
from docling.document_converter import DocumentConverter
import json
import re
from loguru import logger

OLLAMA_EMBED_URL = "http://localhost:11434/api/embeddings"
EMBED_MODEL = "bge-m3"

OLLAMA_MODEL = "llama3.2:latest"
OLLAMA_URL = "http://localhost:11434/api/generate"
PDF_SOURCE = "../Docs/contract_labour_act.pdf"


def embed_text(text: str) -> list[float]:
    """Embed a text string using the local Ollama embedding model."""
    logger.debug(f"Embedding text of length {len(text)} characters.")
    try:
        response = requests.post(
            OLLAMA_EMBED_URL,
            json={
                "model": EMBED_MODEL,
                "prompt": text
            },
            timeout=120
        )
        response.raise_for_status()
        data = response.json()
        embedding = data.get("embedding")
        if embedding is None:
            logger.error("Ollama embedding response did not contain 'embedding' key.")
            raise ValueError("Missing 'embedding' in Ollama response.")
        logger.debug(f"Successfully obtained embedding of dimension {len(embedding)}.")
        return embedding
    except requests.exceptions.Timeout:
        logger.error("Request to Ollama embedding endpoint timed out.")
        raise
    except requests.exceptions.ConnectionError as e:
        logger.error(f"Could not connect to Ollama embedding endpoint: {e}")
        raise
    except requests.exceptions.HTTPError as e:
        logger.error(f"HTTP error from Ollama embedding endpoint: {e}")
        raise
    except (KeyError, ValueError) as e:
        logger.error(f"Unexpected response format from Ollama: {e}")
        raise
    except Exception as e:
        logger.exception(f"Unexpected error while embedding text: {e}")
        raise


def extract_pdf_with_docling(pdf_path, output_name="output"):
    """
    Takes one PDF.
    Uses Docling to extract:
    1. Markdown version
    2. Raw structured JSON
    3. Clean numbered blocks for LLM chunking
    """
    logger.info(f"Starting PDF extraction with Docling: '{pdf_path}' -> '{output_name}'")
    try:
        converter = DocumentConverter()
        result = converter.convert(pdf_path)
        document = result.document

        # 1. Save markdown so you can visually inspect extraction
        logger.debug("Exporting document to Markdown.")
        markdown = document.export_to_markdown()
        try:
            with open(f"{output_name}.md", "w", encoding="utf-8") as f:
                f.write(markdown)
            logger.info(f"Markdown saved: {output_name}.md")
        except OSError as e:
            logger.error(f"Failed to write markdown file '{output_name}.md': {e}")
            raise

        # 2. Save raw Docling JSON
        logger.debug("Exporting document to raw JSON dict.")
        raw_data = document.export_to_dict()
        try:
            with open(f"{output_name}_raw.json", "w", encoding="utf-8") as f:
                json.dump(raw_data, f, indent=2, ensure_ascii=False)
            logger.info(f"Raw JSON saved: {output_name}_raw.json")
        except OSError as e:
            logger.error(f"Failed to write raw JSON file '{output_name}_raw.json': {e}")
            raise

        # 3. Convert Docling output into simple numbered blocks
        blocks = []
        texts = raw_data.get("texts", [])
        logger.debug(f"Processing {len(texts)} text items from raw Docling output.")

        for index, item in enumerate(texts, start=1):
            try:
                text = item.get("text", "").strip()
                if not text:
                    continue
                # Remove extra weird spaces
                text = re.sub(r"\s+", " ", text)
                block = {
                    "block_id": f"b{index:04d}",
                    "page": item.get("prov", [{}])[0].get("page_no"),
                    "label": item.get("label"),
                    "text": text,
                }
                blocks.append(block)
            except (IndexError, AttributeError) as e:
                logger.warning(f"Skipping malformed text item at index {index}: {e}")
                continue

        try:
            with open(f"{output_name}_blocks.json", "w", encoding="utf-8") as f:
                json.dump(blocks, f, indent=2, ensure_ascii=False)
            logger.info(f"Blocks saved: {output_name}_blocks.json")
        except OSError as e:
            logger.error(f"Failed to write blocks JSON file '{output_name}_blocks.json': {e}")
            raise

        logger.info(f"PDF extraction complete. Total blocks: {len(blocks)}.")
        return blocks

    except FileNotFoundError:
        logger.error(f"PDF file not found at path: '{pdf_path}'")
        raise
    except Exception as e:
        logger.exception(f"Unexpected error during PDF extraction of '{pdf_path}': {e}")
        raise


def make_batches(blocks, batch_size=80, overlap=10):
    """
    Splits blocks into smaller groups with overlap.

    Example:
    batch 1 = blocks 1-80
    batch 2 = blocks 71-150
    batch 3 = blocks 141-220

    The repeated 10 blocks are the overlap.
    """
    logger.debug(f"Creating batches: total_blocks={len(blocks)}, batch_size={batch_size}, overlap={overlap}.")
    if batch_size <= overlap:
        logger.error(f"batch_size ({batch_size}) must be greater than overlap ({overlap}).")
        raise ValueError(f"batch_size ({batch_size}) must be greater than overlap ({overlap}).")

    batches = []
    start = 0

    while start < len(blocks):
        end = start + batch_size
        batch = blocks[start:end]
        batches.append(batch)
        start = end - overlap
        if start <= 0:
            start = end

    logger.debug(f"Created {len(batches)} batches.")
    return batches


def ask_llama_for_boundaries(block_batch):
    """
    Sends one batch of blocks to llama3.2.
    Llama returns chunk boundaries only.
    """
    logger.info(f"Sending batch of {len(block_batch)} blocks to LLaMA for boundary detection.")
    try:
        prompt = f"""
    You are helping chunk an Indian legal document.

    You will receive numbered blocks from a PDF.

    Rules:
    - Group consecutive blocks into legally meaningful chunks.
    - Prefer one legal section as one chunk.
    - Keep subsections with their parent section.
    - Do not merge unrelated sections.
    - Do not rewrite the text.
    - Use only block IDs from the input.
    - Return valid JSON only.
    - No markdown.
    - No explanation.
    - If a legal unit continues beyond the end of the provided blocks, do not emit that chunk. Leave it for the next overlapping batch.
    Return format:
    {{
    "chunks": [
        {{
        "title": "Section title here",
        "start_block": "b0001",
        "end_block": "b0005",
        "summary": "Short summary of the chunk.",
        "topics": ["contract labour", "registration"],
        "chunk_type": Literal[
        "definition", "eligibility", "procedure",
        "right", "obligation", "penalty", "exception"
    ] | None = None
        }}
    ]
    }}

    Blocks:
    {json.dumps(block_batch, indent=2, ensure_ascii=False)}
    """

        response = requests.post(
            OLLAMA_URL,
            json={
                "model": OLLAMA_MODEL,
                "prompt": prompt,
                "stream": False,
                "format": "json",
            },
            timeout=120,
        )
        response.raise_for_status()
        data = response.json()

        raw_response = data.get("response", "")
        if not raw_response:
            logger.error("LLaMA returned an empty 'response' field.")
            raise ValueError("LLaMA returned an empty response.")

        parsed = json.loads(raw_response)
        logger.info(f"LLaMA returned {len(parsed.get('chunks', []))} chunk boundaries.")
        return parsed

    except requests.exceptions.Timeout:
        logger.error("Request to LLaMA endpoint timed out.")
        raise
    except requests.exceptions.ConnectionError as e:
        logger.error(f"Could not connect to LLaMA endpoint: {e}")
        raise
    except requests.exceptions.HTTPError as e:
        logger.error(f"HTTP error from LLaMA endpoint: {e}")
        raise
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse JSON from LLaMA response: {e}")
        raise
    except ValueError as e:
        logger.error(f"Value error while processing LLaMA response: {e}")
        raise
    except Exception as e:
        logger.exception(f"Unexpected error while getting chunk boundaries from LLaMA: {e}")
        raise


def create_chunks_and_embed(pdf_source: str, doc_metadata: DocumentMetadata):
    """Extract blocks from a PDF, group them into semantic chunks via LLaMA, then embed each chunk."""
    logger.info(f"Starting chunking and embedding pipeline for: '{pdf_source}'")

    try:
        blocks = extract_pdf_with_docling(pdf_source)
    except Exception as e:
        logger.error(f"Failed to extract PDF '{pdf_source}': {e}")
        raise

    try:
        batches = make_batches(blocks, overlap=10, batch_size=50)
    except Exception as e:
        logger.error(f"Failed to create batches from blocks: {e}")
        raise

    final_chunks = []
    logger.info(f"Processing {len(batches)} batches...")

    for batch_idx, batch in enumerate(batches):
        logger.debug(f"Processing batch {batch_idx + 1}/{len(batches)} ({len(batch)} blocks).")
        try:
            res = ask_llama_for_boundaries(batch)
        except Exception as e:
            logger.error(f"Batch {batch_idx + 1}: Failed to get boundaries from LLaMA, skipping batch. Error: {e}")
            continue

        chunks_in_batch = res.get("chunks", [])
        if not chunks_in_batch:
            logger.warning(f"Batch {batch_idx + 1}: LLaMA returned no chunks.")
            continue

        for r in chunks_in_batch:
            try:
                start_block_id = r.get("start_block")
                end_block_id = r.get("end_block")

                if not start_block_id or not end_block_id:
                    logger.warning(f"Chunk entry missing start_block or end_block: {r}")
                    continue

                start_index = None
                end_found = False
                block_texts = []

                for i, b in enumerate(batch):
                    if b["block_id"] == start_block_id:
                        start_index = i

                    if start_index is not None:
                        block_texts.append(b["text"])

                    if b["block_id"] == end_block_id:
                        end_found = True
                        break

                if start_index is None:
                    logger.warning(f"Start block '{start_block_id}' not found in batch {batch_idx + 1}. Skipping chunk.")
                    continue

                if not end_found:
                    logger.warning(f"End block '{end_block_id}' not found in batch {batch_idx + 1}. Skipping chunk.")
                    continue

                chunk_text = "\n\n".join(block_texts)

                try:
                    embedding = embed_text(chunk_text)
                except Exception as e:
                    logger.error(f"Failed to embed chunk '{r.get('title', 'unknown')}': {e}. Skipping chunk.")
                    continue

                try:
                    chunk_metadata = ChunkMetadata(
                        document_title=doc_metadata.document_title,
                        document_type=doc_metadata.document_type,
                        issuing_authority=doc_metadata.issuing_authority,
                        date=doc_metadata.date,
                        domain=doc_metadata.domain,
                        chunk_type=r["chunk_type"],
                        heading=r["title"],
                        summary=r.get("summary"),
                        topics=r.get("topics", []),
                    )
                except (KeyError, Exception) as e:
                    logger.error(f"Failed to build ChunkMetadata for chunk '{r.get('title', 'unknown')}': {e}. Skipping.")
                    continue

                final_chunks.append({
                    "chunk_id": f"chunk_{len(final_chunks) + 1:05d}",
                    "chunk_metadata": chunk_metadata.model_dump(mode="json"),
                    "embedding": embedding,
                    "text": chunk_text,
                })
                logger.debug(f"Chunk '{r.get('title')}' added (total so far: {len(final_chunks)}).")

            except Exception as e:
                logger.error(f"Batch {batch_idx + 1}: Unexpected error processing chunk entry {r}: {e}")
                continue

    logger.info(f"Chunking and embedding complete. Total chunks produced: {len(final_chunks)}.")
    return final_chunks


# Local path or direct URL

def main():
    pdf_source = "../Docs/contract_labour_act.pdf"
    output_name = "contract_labour_act"

    logger.info("Step 1: Extracting PDF with Docling...")
    try:
        blocks = extract_pdf_with_docling(
            pdf_path=pdf_source,
            output_name=output_name,
        )
        logger.info(f"Extracted {len(blocks)} blocks.")
    except Exception as e:
        logger.critical(f"PDF extraction failed, aborting: {e}")
        return

    logger.info("Step 2: Creating batches...")
    try:
        batches = make_batches(
            blocks=blocks,
            batch_size=80,
            overlap=10,
        )
        logger.info(f"Created {len(batches)} batches.")
    except Exception as e:
        logger.critical(f"Batch creation failed, aborting: {e}")
        return

    logger.info("Step 3: Sending first batch to local llama3.2...")
    try:
        first_batch = batches[0]
        result = ask_llama_for_boundaries(first_batch)
    except IndexError:
        logger.error("No batches were created; cannot send to LLaMA.")
        return
    except Exception as e:
        logger.critical(f"LLaMA boundary detection failed, aborting: {e}")
        return

    logger.info("Step 4: Saving LLM result...")
    try:
        with open(f"{output_name}_first_batch_boundaries.json", "w", encoding="utf-8") as f:
            json.dump(result, f, indent=2, ensure_ascii=False)
        logger.info(f"Saved result to {output_name}_first_batch_boundaries.json")
    except OSError as e:
        logger.error(f"Failed to save LLM result to file: {e}")
        raise

    logger.info("Done.")


if __name__ == "__main__":
    main()