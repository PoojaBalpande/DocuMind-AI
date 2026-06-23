"""Reusable validation utilities for API path parameters and request data."""

import uuid

from fastapi import HTTPException, status


def validate_uuid(value: str, field_name: str = "id") -> str:
    """Validate that a string is a well-formed UUID v4.

    Args:
        value: The string to validate.
        field_name: Human-readable name for error messages (e.g. "document_id").

    Returns:
        The original string if valid.

    Raises:
        HTTPException: 422 if the value is not a valid UUID.
    """
    try:
        uuid.UUID(value, version=4)
    except (ValueError, AttributeError):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid {field_name}: must be a valid UUID.",
        )
    return value


def validate_non_empty_string(value: str) -> str:
    """Ensure a string is not empty or whitespace-only.

    Raises:
        ValueError: If the string is empty or whitespace-only.
    """
    if not value or not value.strip():
        raise ValueError("must not be empty or whitespace-only")
    return value


def strip_whitespace(value: str) -> str:
    """Strip leading and trailing whitespace from a string."""
    if value is not None:
        return value.strip()
    return value


def validate_uuid_format(value: str) -> str:
    """Ensure a string is a valid UUID v4 format.

    Raises:
        ValueError: If the string is not a valid UUID.
    """
    if value is not None:
        try:
            uuid.UUID(value, version=4)
        except (ValueError, AttributeError):
            raise ValueError("must be a valid UUID format")
    return value


def sanitize_filename(filename: str) -> str:
    """Sanitize the uploaded filename to prevent XSS, HTML injection, and path traversal.

    Preserves extension and alphanumeric characters/common separators.
    """
    import os
    import re
    if not filename:
        return "untitled.pdf"

    # Get only the base name of the path (stripping directory components)
    filename = os.path.basename(filename)
    filename = filename.replace("../", "").replace("..\\", "")

    # Remove HTML tags and script fragments using a regex
    filename = re.sub(r"<[^>]*>", "", filename)

    # Keep only alphanumeric, spaces, hyphens, underscores, and dots.
    sanitized = re.sub(r"[^\w\s\.-]", "", filename)

    # Strip leading/trailing whitespace
    sanitized = sanitized.strip()

    # If after all sanitization the filename is empty, default it
    if not sanitized or sanitized in (".", ".."):
        return "file.pdf"

    return sanitized


def validate_pdf_structure(file_path: str) -> None:
    """Verifies that PyMuPDF (fitz) can open the file and read its pages.

    Raises:
        HTTPException 400 if the file cannot be parsed or has 0 pages.
    """
    try:
        import fitz
        doc = fitz.open(file_path)
        if len(doc) == 0:
            raise ValueError("PDF has 0 pages.")
        # Attempt to load the first page to check readability
        doc.load_page(0)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or corrupted PDF document. The file structure could not be parsed.",
        )


async def stream_validate_and_save(file, target_path: str, max_bytes: int) -> int:
    """Streams the upload file, validates the PDF header and size, and writes it to disk.

    Raises:
        HTTPException 400: If the magic bytes are missing or invalid PDF.
        HTTPException 413: If the file size exceeds max_bytes.
    """
    import os
    chunk_size = 1024 * 64  # 64 KB chunks
    total_bytes = 0
    is_first_chunk = True

    try:
        with open(target_path, "wb") as f:
            while True:
                chunk = await file.read(chunk_size)
                if not chunk:
                    break

                if is_first_chunk:
                    # Check PDF signature
                    if not chunk.startswith(b"%PDF-"):
                        raise HTTPException(
                            status_code=status.HTTP_400_BAD_REQUEST,
                            detail="Invalid file format. Only valid PDF documents starting with '%PDF-' are accepted.",
                        )
                    is_first_chunk = False

                total_bytes += len(chunk)
                if total_bytes > max_bytes:
                    raise HTTPException(
                        status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                        detail=f"File too large. Maximum size is {max_bytes // (1024 * 1024)} MB.",
                    )
                
                f.write(chunk)

        if is_first_chunk:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uploaded file is empty.",
            )

    except Exception as e:
        # Cleanup partially saved file if it exists
        if os.path.exists(target_path):
            try:
                os.remove(target_path)
            except OSError:
                pass
        raise e

    return total_bytes


