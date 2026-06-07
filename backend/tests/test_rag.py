import pytest
import uuid
from unittest.mock import patch, MagicMock
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.user import User
from app.models.document import Document
from app.models.document_chunk import DocumentChunk
from app.services.document_processor.ingestion_service import ingest_document
from app.services.rag.retriever import retrieve_relevant_chunks
from app.services.rag.rag_pipeline import run_rag_pipeline


@pytest.fixture(scope="module")
def db() -> Session:
    session = SessionLocal()
    yield session
    session.close()


@pytest.fixture
def test_user(db: Session) -> User:
    # Create a temporary user to satisfy foreign key constraints
    user = User(
        id=str(uuid.uuid4()),
        name="Test User",
        email=f"test_{uuid.uuid4()}@example.com",
        hashed_password="hashed_password_placeholder",
        is_active=True,
        is_admin=False
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    yield user
    db.delete(user)
    db.commit()


# 1. Test Document Ingestion Pipeline
@patch("app.services.document_processor.ingestion_service.load_pdf")
@patch("app.services.document_processor.ingestion_service.generate_embeddings")
def test_document_ingestion(mock_embeds, mock_pdf, test_user, db):
    # Setup mock returns
    mock_pdf.return_value = [
        {"page": 1, "text": "This is a document about machine learning scope and systems."},
        {"page": 2, "text": "The project uses OpenAI embeddings and pgvector database."}
    ]
    # 2 text blocks, so 2 chunks
    mock_embeds.return_value = [
        [0.1] * 384,
        [0.2] * 384
    ]

    # Create dummy document record linked to the valid test user
    test_doc = Document(
        user_id=test_user.id,
        filename="test_file.pdf",
        original_filename="test_file.pdf",
        file_size=1024,
        storage_path="test_file.pdf",
        status="uploading"
    )
    db.add(test_doc)
    db.commit()
    db.refresh(test_doc)

    try:
        # Run ingestion pipeline
        ingest_document(db, test_doc.id)

        # Assert document status and created chunks
        db.refresh(test_doc)
        assert test_doc.status == "ready"

        chunks = db.query(DocumentChunk).filter(DocumentChunk.document_id == test_doc.id).all()
        assert len(chunks) == 2
        assert chunks[0].chunk_index == 0
        assert chunks[0].page_number == 1
        assert "machine learning" in chunks[0].content
        assert chunks[1].chunk_index == 1
        assert chunks[1].page_number == 2
        assert "pgvector" in chunks[1].content
    finally:
        # Cleanup (cascade deletes chunks automatically)
        db.delete(test_doc)
        db.commit()


# 2. Test Retrieval similarity search
@patch("app.services.rag.retriever.generate_embedding")
def test_retriever_similarity_search(mock_embed, test_user, db):
    # Mock embedding query returning similar format
    mock_embed.return_value = [0.1] * 384

    # Create a document and chunks with distinct embeddings linked to test user
    test_doc = Document(
        user_id=test_user.id,
        filename="retrieval_test.pdf",
        original_filename="retrieval_test.pdf",
        file_size=512,
        storage_path="retrieval_test.pdf",
        status="ready"
    )
    db.add(test_doc)
    db.commit()
    db.refresh(test_doc)

    try:
        chunk1 = DocumentChunk(
            document_id=test_doc.id,
            chunk_index=0,
            content="This matches the embedding perfectly.",
            embedding=[0.1] * 384,  # perfect match
            page_number=1
        )
        chunk2 = DocumentChunk(
            document_id=test_doc.id,
            chunk_index=1,
            content="This is very different and far away.",
            embedding=[0.9] * 384,  # far match
            page_number=2
        )
        db.add(chunk1)
        db.add(chunk2)
        db.commit()

        # Query retriever
        results = retrieve_relevant_chunks(db, test_user.id, "perfect matches", limit=1)
        assert len(results) == 1
        assert results[0]["content"] == "This matches the embedding perfectly."
        assert results[0]["document"] == "retrieval_test.pdf"
        assert results[0]["page"] == 1
    finally:
        db.delete(test_doc)
        db.commit()


# 3. Test RAG Pipeline end-to-end
@patch("app.services.rag.retriever.generate_embedding")
@patch("app.services.rag.llm_service.requests.post")
def test_rag_pipeline_flow(mock_post, mock_embed, test_user, db):
    # Mock embeddings and Ollama API responses
    mock_embed.return_value = [0.1] * 384

    mock_response = MagicMock()
    mock_response.json.return_value = {
        "message": {
            "content": "The project uses pgvector."
        }
    }
    mock_post.return_value = mock_response

    # Create document + chunk linked to test user
    test_doc = Document(
        user_id=test_user.id,
        filename="rag_test.pdf",
        original_filename="rag_test.pdf",
        file_size=512,
        storage_path="rag_test.pdf",
        status="ready"
    )
    db.add(test_doc)
    db.commit()
    db.refresh(test_doc)

    try:
        chunk = DocumentChunk(
            document_id=test_doc.id,
            chunk_index=0,
            content="The project uses pgvector.",
            embedding=[0.1] * 384,
            page_number=3
        )
        db.add(chunk)
        db.commit()

        # Run pipeline
        res = run_rag_pipeline(db, test_user.id, "What does the project use?")
        assert "pgvector" in res["answer"]
        assert len(res["sources"]) == 1
        assert res["sources"][0]["document"] == "rag_test.pdf"
        assert res["sources"][0]["page"] == 3
    finally:
        db.delete(test_doc)
        db.commit()
