from typing import List, Any, Dict
from collections import defaultdict


def format_document_context(chunks: List[Any]) -> str:
    """Group retrieved chunks by document, preserving retrieval ranking and citation metadata.

    Args:
        chunks: List of retrieved chunks, which can be dicts or chunk models.

    Returns:
        A structured string organizing context by document.
    """
    if not chunks:
        return ""

    grouped_chunks = defaultdict(list)
    doc_order = []

    # Group chunks by document filename while keeping their relative order of retrieval
    for chunk in chunks:
        if isinstance(chunk, dict):
            doc_name = chunk.get("document") or "Unknown Document"
        else:
            doc_name = getattr(chunk, "document", None) or "Unknown Document"

        if doc_name not in grouped_chunks:
            doc_order.append(doc_name)
        grouped_chunks[doc_name].append(chunk)

    formatted_docs = []
    for doc_name in doc_order:
        doc_section_parts = [f"[Document: {doc_name}]"]
        
        for chunk in grouped_chunks[doc_name]:
            if isinstance(chunk, dict):
                content = chunk.get("content") or ""
                page = chunk.get("page")
            else:
                content = getattr(chunk, "content", "") or ""
                page = getattr(chunk, "page", None)
                
            page_lbl = f"[Page {page}] " if page is not None else ""
            doc_section_parts.append(f"{page_lbl}Content:\n{content.strip()}")
            
        formatted_docs.append("\n\n".join(doc_section_parts))

    return "\n\n---\n\n".join(formatted_docs)
