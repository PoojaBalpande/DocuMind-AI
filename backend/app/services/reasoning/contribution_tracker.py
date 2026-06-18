from uuid import UUID
from pydantic import BaseModel
from typing import List, Any, Dict


class DocumentContribution(BaseModel):
    """Represents a document and the chunks from it that contributed to a response."""
    document_id: UUID
    document_name: str
    chunk_ids: List[str]


def build_document_contributions(chunks: List[Any]) -> List[DocumentContribution]:
    """Aggregate chunk IDs per document, removing duplicates and preserving metadata.

    Args:
        chunks: List of retrieved chunks (dicts or models).

    Returns:
        A list of DocumentContribution Pydantic models.
    """
    contributions_map: Dict[UUID, Dict[str, Any]] = {}

    for chunk in chunks:
        # Extract fields supporting both dict and object models
        if isinstance(chunk, dict):
            doc_id_val = chunk.get("document_id")
            doc_name = chunk.get("document") or "Unknown Document"
            chunk_id_val = chunk.get("chunk_id")
        else:
            doc_id_val = getattr(chunk, "document_id", None)
            doc_name = getattr(chunk, "document", None) or "Unknown Document"
            chunk_id_val = getattr(chunk, "chunk_id", None)

        if not doc_id_val:
            continue

        # Convert doc_id_val to UUID if it's a string
        if isinstance(doc_id_val, str):
            try:
                doc_uuid = UUID(doc_id_val)
            except ValueError:
                continue
        elif isinstance(doc_id_val, UUID):
            doc_uuid = doc_id_val
        else:
            continue

        if doc_uuid not in contributions_map:
            contributions_map[doc_uuid] = {
                "document_name": doc_name,
                "chunk_ids": []
            }

        if chunk_id_val:
            chunk_id_str = str(chunk_id_val)
            if chunk_id_str not in contributions_map[doc_uuid]["chunk_ids"]:
                contributions_map[doc_uuid]["chunk_ids"].append(chunk_id_str)

    return [
        DocumentContribution(
            document_id=doc_uuid,
            document_name=data["document_name"],
            chunk_ids=data["chunk_ids"]
        )
        for doc_uuid, data in contributions_map.items()
    ]
