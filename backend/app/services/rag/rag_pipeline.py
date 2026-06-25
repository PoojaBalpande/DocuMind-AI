import logging
from sqlalchemy.orm import Session
from app.services.rag.retriever import retrieve_relevant_chunks
from app.services.settings_service import SettingsService
from app.services.rag.prompt_builder import build_context
from app.services.rag.llm_service import answer_question
from app.services.reasoning import (
    detect_reasoning_intent,
    format_document_context,
    build_reasoning_prompt,
    build_document_contributions,
)

logger = logging.getLogger(__name__)


def run_rag_pipeline(
    db: Session,
    user_id: str,
    question: str,
    document_ids: list[str] | None = None,
) -> dict:
    """Run similarity search and LLM completion to answer a question grounded in user docs.

    Args:
        db: SQLAlchemy session.
        user_id: Authenticated user's ID.
        question: The user's natural-language question.
        document_ids: Optional. When None, retrieves across all user documents.
            When a list of document IDs, restricts search to those documents.

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
                }],
                "reasoning_intent": "...",
                "document_contributions": [...]
            }
    """
    # 1. Retrieve top chunks using user-configured settings
    settings = SettingsService.get_or_create_settings(db, user_id)
    limit = settings.retrieval_top_k
    chunks = retrieve_relevant_chunks(
        db, user_id, question, limit=limit, document_ids=document_ids
    )

    logger.info(f"RETRIEVAL PIPELINE: Retrieved {len(chunks)} chunks for user_id: {user_id}")
    for idx, chunk in enumerate(chunks):
        logger.info(f"Chunk {idx}: document={chunk['document']}, page={chunk['page']}, score={chunk['similarity_score']}")
        logger.info(f"Chunk {idx} content: {chunk['content'][:200]}...")  # log first 200 chars for brevity

    if not chunks:
        return {
            "answer": "I could not find this information in the uploaded documents.",
            "sources": [],
            "reasoning_intent": "default",
            "document_contributions": [],
        }

    # 1. Immediately before build_reasoning_prompt():
    logger.debug(f"===== RETRIEVED CHUNKS =====\n{chunks}")

    # 2. Detect Intent, format context, build prompt, and track contributions
    intent = detect_reasoning_intent(question)
    context = format_document_context(chunks)

    # 2. Immediately after format_document_context():
    logger.debug(f"===== FORMATTED CONTEXT =====\n{context}")

    prompt = build_reasoning_prompt(intent, question, context)

    # 3. Immediately after build_reasoning_prompt():
    logger.debug(f"===== FINAL PROMPT =====\n{prompt}")

    contributions = build_document_contributions(chunks)

    # 4. Immediately before answer_question():
    logger.debug(f"===== PROMPT SENT TO LLM =====\n{prompt}")

    # 3. Generate answer using LLM
    answer = answer_question(
        question,
        context,
        custom_prompt=prompt,
        temperature=settings.temperature,
        max_tokens=settings.max_tokens,
    )

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
        "sources": sources,
        "reasoning_intent": intent.value,
        "document_contributions": [c.model_dump(mode="json") for c in contributions],
    }
