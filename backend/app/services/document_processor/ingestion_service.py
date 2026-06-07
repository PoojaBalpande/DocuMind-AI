"""Document ingestion pipeline service."""

import logging
from sqlalchemy.orm import Session
from app.models.document import Document
from app.models.document_chunk import DocumentChunk
from app.services.document_processor.pdf_loader import load_pdf
from app.services.document_processor.chunker import chunk_document
from app.services.document_processor.embedding_service import generate_embeddings

logger = logging.getLogger(__name__)


def ingest_document(db: Session, document_id: str) -> None:
    """Document Ingestion Pipeline:

    1. Load PDF and extract text.
    2. Split text into chunks.
    3. Generate embeddings for the chunks.
    4. Save chunks and embeddings into PostgreSQL.
    5. Update document status to 'ready' (or 'failed' on error).
    """
    logger.info(f"Starting ingestion for document {document_id}")
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        logger.error(f"Document {document_id} not found in database.")
        return

    try:
        # Step 1: Update status to processing
        document.status = "processing"
        db.commit()

        # Step 2: Extract text from PDF
        logger.info(f"Extracting text from PDF: {document.storage_path}")
        pages = load_pdf(document.storage_path)

        # Step 3: Chunk text
        logger.info(f"Chunking document text...")
        chunks = chunk_document(pages)
        if not chunks:
            logger.info("No text extracted from PDF, marking ready directly.")
            document.status = "ready"
            db.commit()
            return

        # Step 4: Generate Embeddings
        logger.info(f"Generating embeddings for {len(chunks)} chunks...")
        texts = [chunk["content"] for chunk in chunks]
        
        # Batch generation
        embeddings = generate_embeddings(texts)

        # Step 5: Store chunks in database
        logger.info("Storing chunks in database...")
        for i, chunk_data in enumerate(chunks):
            db_chunk = DocumentChunk(
                document_id=document.id,
                chunk_index=chunk_data["chunk_index"],
                content=chunk_data["content"],
                embedding=embeddings[i],
                page_number=chunk_data["page_number"]
            )
            db.add(db_chunk)

        # Step 6: Mark document as ready
        document.status = "ready"
        db.commit()
        logger.info(f"Document {document_id} successfully ingested and ready.")

    except Exception as e:
        logger.exception(f"Failed to ingest document {document_id}: {str(e)}")
        db.rollback()
        # Mark document as failed
        try:
            document = db.query(Document).filter(Document.id == document_id).first()
            if document:
                document.status = "failed"
                db.commit()
        except Exception:
            pass
        raise e
