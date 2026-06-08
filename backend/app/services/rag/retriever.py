"""Retriever service for similarity search using pgvector."""

from sqlalchemy.orm import Session
from app.models.document_chunk import DocumentChunk
from app.models.document import Document
from app.services.document_processor.embedding_service import generate_embedding


def retrieve_relevant_chunks(db: Session, user_id: str, question: str, limit: int = 5) -> list[dict]:
    """Retrieve top N relevant chunks for the user's question.

    Returns:
        List of dicts: [{"content": "...", "page": 1, "document": "report.pdf"}]
    """
    # Step 1: Generate embedding for the question
    query_embedding = generate_embedding(question)

    # Step 2: Query database using cosine distance
    results = (
        db.query(DocumentChunk, Document.original_filename)
        .join(Document, Document.id == DocumentChunk.document_id)
        .filter(Document.user_id == user_id)
        .order_by(DocumentChunk.embedding.cosine_distance(query_embedding))
        .limit(limit)
        .all()
    )

    # Step 3: Format output
    chunks = []
    for chunk, original_filename in results:
        chunks.append({
            "content": chunk.content,
            "page": chunk.page_number,
            "document": original_filename,
            "document_id": chunk.document_id
        })
    return chunks
