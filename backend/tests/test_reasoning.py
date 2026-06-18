import pytest
from uuid import uuid4
from app.services.reasoning.intent_detector import ReasoningIntent, detect_reasoning_intent
from app.services.reasoning.context_formatter import format_document_context
from app.services.reasoning.prompt_builder import build_reasoning_prompt
from app.services.reasoning.contribution_tracker import build_document_contributions


def test_intent_detection():
    # Test Comparison intent
    assert detect_reasoning_intent("Compare the financial statements of Q1 and Q2") == ReasoningIntent.COMPARISON
    assert detect_reasoning_intent("What is Q1 vs Q2?") == ReasoningIntent.COMPARISON

    # Test Similarity intent
    assert detect_reasoning_intent("What are the similarities between them?") == ReasoningIntent.SIMILARITY
    assert detect_reasoning_intent("Are there common themes?") == ReasoningIntent.SIMILARITY

    # Test Difference intent
    assert detect_reasoning_intent("What is the difference between these processes?") == ReasoningIntent.DIFFERENCE
    assert detect_reasoning_intent("Contrast the two systems") == ReasoningIntent.DIFFERENCE

    # Test Synthesis intent
    assert detect_reasoning_intent("Summarize all documents") == ReasoningIntent.SYNTHESIS
    assert detect_reasoning_intent("Synthesize the overview") == ReasoningIntent.SYNTHESIS

    # Test Coverage intent
    assert detect_reasoning_intent("Which document discusses fraud?") == ReasoningIntent.COVERAGE
    assert detect_reasoning_intent("Most extensive coverage of security") == ReasoningIntent.COVERAGE

    # Test Default fallback
    assert detect_reasoning_intent("What is machine learning?") == ReasoningIntent.DEFAULT
    assert detect_reasoning_intent("") == ReasoningIntent.DEFAULT


def test_context_formatting():
    chunks = [
        {"document": "DocA.pdf", "page": 1, "content": "Intro to ML.", "chunk_id": "c1", "document_id": str(uuid4())},
        {"document": "DocB.pdf", "page": 3, "content": "pgvector intro.", "chunk_id": "c2", "document_id": str(uuid4())},
        {"document": "DocA.pdf", "page": 2, "content": "Advanced ML.", "chunk_id": "c3", "document_id": str(uuid4())},
    ]

    formatted = format_document_context(chunks)
    
    # Asserting grouping
    assert "[Document: DocA.pdf]" in formatted
    assert "[Document: DocB.pdf]" in formatted
    
    # Asserting relative order within documents
    doc_a_idx_1 = formatted.index("Intro to ML.")
    doc_a_idx_2 = formatted.index("Advanced ML.")
    assert doc_a_idx_1 < doc_a_idx_2

    # Asserting page number formatting
    assert "[Page 1] Content:\nIntro to ML." in formatted
    assert "[Page 3] Content:\npgvector intro." in formatted


def test_prompt_builder():
    context = "[Document: DocA.pdf]\n[Page 1]\nIntro to ML."
    question = "What is the summary?"
    
    prompt = build_reasoning_prompt(ReasoningIntent.COMPARISON, question, context)
    
    # Assert section headers
    assert "- Document Summaries" in prompt
    assert "- Similarities" in prompt
    assert "- Differences" in prompt
    assert "- Conclusion" in prompt
    
    # Assert guidelines
    assert "Use evidence only from retrieved context" in prompt
    assert "Mention document names when relevant" in prompt
    assert "Do not invent relationships" in prompt


def test_contribution_tracking():
    doc_id_1 = uuid4()
    doc_id_2 = uuid4()
    
    chunks = [
        {"document": "DocA.pdf", "page": 1, "content": "Intro to ML.", "chunk_id": "c1", "document_id": doc_id_1},
        {"document": "DocB.pdf", "page": 3, "content": "pgvector intro.", "chunk_id": "c2", "document_id": doc_id_2},
        {"document": "DocA.pdf", "page": 2, "content": "Advanced ML.", "chunk_id": "c1", "document_id": doc_id_1}, # duplicate chunk_id
        {"document": "DocA.pdf", "page": 2, "content": "Advanced ML.", "chunk_id": "c3", "document_id": doc_id_1},
    ]

    contributions = build_document_contributions(chunks)
    assert len(contributions) == 2

    doc_cont_1 = next(c for c in contributions if c.document_id == doc_id_1)
    doc_cont_2 = next(c for c in contributions if c.document_id == doc_id_2)

    assert doc_cont_1.document_name == "DocA.pdf"
    # c1 should only appear once (deduplicated)
    assert sorted(doc_cont_1.chunk_ids) == ["c1", "c3"]

    assert doc_cont_2.document_name == "DocB.pdf"
    assert doc_cont_2.chunk_ids == ["c2"]
