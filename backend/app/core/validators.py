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
