from urllib.parse import urlparse
import requests
from pathlib import Path
import fitz
from loguru import logger


def download(url: str, filepath: Path, file_title: str) -> Path:
    """Download a file from `url` and save it under `filepath/file_title`."""
    logger.info(f"Downloading file from '{url}' as '{file_title}' into '{filepath}'.")
    try:
        response = requests.get(url, timeout=120)
        response.raise_for_status()
    except requests.exceptions.Timeout:
        logger.error(f"Download request timed out for URL: '{url}'.")
        raise
    except requests.exceptions.ConnectionError as e:
        logger.error(f"Connection error while downloading '{url}': {e}")
        raise
    except requests.exceptions.HTTPError as e:
        logger.error(f"HTTP error while downloading '{url}': {e} (status {response.status_code})")
        raise
    except requests.exceptions.RequestException as e:
        logger.error(f"Request error while downloading '{url}': {e}")
        raise

    filename = file_title
    dest = Path(filepath, filename)

    try:
        with open(dest, "wb") as f:
            f.write(response.content)
        logger.info(f"File saved to '{dest}' ({len(response.content)} bytes).")
    except OSError as e:
        logger.error(f"Failed to write downloaded file to '{dest}': {e}")
        raise

    return dest


def extract_text(filepath: Path) -> str:
    """Extract plain text from a PDF file using PyMuPDF (fitz)."""
    logger.info(f"Extracting text from PDF: '{filepath}'.")
    text = ""
    try:
        with fitz.open(filepath) as doc:
            num_pages = len(doc)
            logger.debug(f"Opened PDF '{filepath}' with {num_pages} page(s).")
            for page_num, page in enumerate(doc, start=1):
                try:
                    page_text = page.get_text()  # type: ignore
                    text += page_text
                except Exception as e:
                    logger.warning(f"Failed to extract text from page {page_num} of '{filepath}': {e}. Skipping page.")
                    continue
    except FileNotFoundError:
        logger.error(f"PDF file not found: '{filepath}'.")
        raise
    except fitz.FileDataError as e:
        logger.error(f"PyMuPDF could not open '{filepath}' (corrupt or invalid PDF?): {e}")
        raise
    except Exception as e:
        logger.exception(f"Unexpected error extracting text from '{filepath}': {e}")
        raise

    logger.info(f"Text extraction complete for '{filepath}'. Total characters: {len(text)}.")
    return text