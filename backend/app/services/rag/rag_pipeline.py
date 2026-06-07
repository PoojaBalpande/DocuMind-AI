"""RAG pipeline coordinating retriever, context building, and LLM answering."""

from sqlalchemy.orm import Session
from app.services.rag.retriever import retrieve_relevant_chunks
from app.services.rag.prompt_builder import build_context
from app.services.rag.llm_service import answer_question


def run_rag_pipeline(db: Session, user_id: str, question: str) -> dict:
    """Run similarity search and LLM completion to answer a question grounded in user docs.

    Returns:
        Dict: {"answer": "...", "sources": [{"document": "...", "page": 3}]}
    """
    # 1. Retrieve top chunks
    chunks = retrieve_relevant_chunks(db, user_id, question, limit=2)

    import logging
    logger = logging.getLogger(__name__)
    logger.info(f"RETRIEVAL PIPELINE: Retrieved {len(chunks)} chunks for user_id: {user_id}")
    for idx, chunk in enumerate(chunks):
        logger.info(f"Chunk {idx}: document={chunk['document']}, page={chunk['page']}")
        logger.info(f"Chunk {idx} content: {chunk['content'][:200]}...")  # log first 200 chars for brevity

    if not chunks:
        return {
            "answer": "I could not find this information in the uploaded documents.",
            "sources": []
        }

    # 2. Build Prompt Context
    context = build_context(chunks)

    # 3. Generate answer using GPT-4o
    answer = answer_question(question, context)

    # 4. Extract unique source citations
    sources = []
    for chunk in chunks:
        source_entry = {
            "document": chunk["document"],
            "page": chunk["page"]
        }
        if source_entry not in sources:
            sources.append(source_entry)

    return {
        "answer": answer,
        "sources": sources
    }
