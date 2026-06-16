"""Retriever service for similarity search using pgvector.

V8: Supports multi-document retrieval (all user docs) and single-document
retrieval (filtered by document_id).  Returns enriched metadata including
chunk_id and similarity_score.
"""

from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.document_chunk import DocumentChunk
from app.models.document import Document
from app.services.document_processor.embedding_service import generate_embedding


def retrieve_relevant_chunks(
    db: Session,
    user_id: str,
    question: str,
    limit: int = 5,
    document_ids: list[str] | None = None,
) -> list[dict]:
    """Retrieve top N relevant chunks for the user's question.

    Args:
        db: SQLAlchemy session.
        user_id: Authenticated user's ID — used to scope all queries.
        question: The user's natural-language question.
        limit: Maximum number of chunks to return.
        document_ids: Optional. When provided, restricts retrieval to the specified
            documents. When None, searches across all of the user's documents.

    Returns:
        List of dicts with enriched metadata::

            [{
                "chunk_id": "...",
                "content": "...",
                "page": 1,
                "document": "report.pdf",
                "document_id": "...",
                "similarity_score": 0.87,
            }]
    """
    # Step 1: Generate embedding for the question
    query_embedding = generate_embedding(question)

    # Step 2: Build the cosine distance expression for reuse
    cosine_dist = DocumentChunk.embedding.cosine_distance(query_embedding)

    # Step 3: Build base query — always scoped to user
    query = (
        db.query(
            DocumentChunk,
            Document.original_filename,
            cosine_dist.label("distance"),
        )
        .join(Document, Document.id == DocumentChunk.document_id)
        .filter(Document.user_id == user_id)
    )

    # Step 4: Optionally filter to specific documents
    if document_ids is not None:
        query = query.filter(DocumentChunk.document_id.in_(document_ids))

    # Step 5: Order by similarity and limit
    results = (
        query
        .order_by(cosine_dist)
        .limit(limit)
        .all()
    )

    # Step 6: Format output with enriched metadata
    chunks = []
    for chunk, original_filename, distance in results:
        # Convert cosine distance (0 = identical, 2 = opposite) to a
        # similarity score in [0, 1] where 1 = most similar.
        similarity_score = round(max(0.0, 1.0 - float(distance)), 4)

        chunks.append({
            "chunk_id": chunk.id,
            "content": chunk.content,
            "page": chunk.page_number,
            "document": original_filename,
            "document_id": chunk.document_id,
            "similarity_score": similarity_score,
        })

    return chunks
