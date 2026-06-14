"""RAG pipeline coordinating retriever, context building, and LLM answering.

V8: Supports multi-document retrieval via optional document_id parameter.
Returns enriched source metadata (chunk_id, document_id, similarity_score).
"""

import logging
from sqlalchemy.orm import Session
from app.services.rag.retriever import retrieve_relevant_chunks
from app.services.rag.prompt_builder import build_context
from app.services.rag.llm_service import answer_question

logger = logging.getLogger(__name__)


def run_rag_pipeline(
    db: Session,
    user_id: str,
    question: str,
    document_id: str | None = None,
) -> dict:
    """Run similarity search and LLM completion to answer a question grounded in user docs.

    Args:
        db: SQLAlchemy session.
        user_id: Authenticated user's ID.
        question: The user's natural-language question.
        document_id: Optional. When None, retrieves across all user documents
            (multi-doc mode). When a string, restricts to that single document.

    Returns:
        Dict::

            {
                "answer": "...",
                "sources": [{
                    "document": "report.pdf",
                    "document_id": "...",
                    "page": 3,
                    "chunk_id": "...",
                    "snippet": "...",
                    "similarity_score": 0.87,
                }]
            }
    """
    # 1. Retrieve top chunks (5 for multi-doc breadth, 2 for single-doc focus)
    limit = 5 if document_id is None else 2
    chunks = retrieve_relevant_chunks(
        db, user_id, question, limit=limit, document_id=document_id
    )

    logger.info(f"RETRIEVAL PIPELINE: Retrieved {len(chunks)} chunks for user_id: {user_id}")
    for idx, chunk in enumerate(chunks):
        logger.info(f"Chunk {idx}: document={chunk['document']}, page={chunk['page']}, score={chunk['similarity_score']}")
        logger.info(f"Chunk {idx} content: {chunk['content'][:200]}...")  # log first 200 chars for brevity

    if not chunks:
        return {
            "answer": "I could not find this information in the uploaded documents.",
            "sources": []
        }

    # 2. Build Prompt Context
    context = build_context(chunks)

    # 3. Generate answer using LLM
    answer = answer_question(question, context)

    # 4. Build enriched source citations (deduplicated by chunk_id)
    seen_chunk_ids = set()
    sources = []
    for chunk in chunks:
        cid = chunk.get("chunk_id")
        if cid and cid in seen_chunk_ids:
            continue
        if cid:
            seen_chunk_ids.add(cid)

        sources.append({
            "document": chunk["document"],
            "document_id": chunk["document_id"],
            "page": chunk["page"],
            "chunk_id": chunk.get("chunk_id"),
            "snippet": chunk["content"],
            "similarity_score": chunk.get("similarity_score"),
        })

    return {
        "answer": answer,
        "sources": sources
    }
