"""Documents API endpoints — list, upload, delete."""

import os
import uuid
import logging
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status, BackgroundTasks
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.config import settings
from app.core.security import get_current_user
from app.core.validators import validate_uuid, sanitize_filename, validate_pdf_structure, stream_validate_and_save
from app.models.user import User
from app.models.document import Document
from app.schemas.document import DocumentResponse, DocumentListResponse, UploadResponse
from app.services.document_processor.ingestion_service import ingest_document

router = APIRouter()
logger = logging.getLogger(__name__)

ALLOWED_MIME_TYPES = {"application/pdf"}
MAX_UPLOAD_BYTES = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024


@router.get("", response_model=DocumentListResponse)
def list_documents(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List all documents for the authenticated user."""
    docs = (
        db.query(Document)
        .filter(Document.user_id == current_user.id)
        .order_by(Document.created_at.desc())
        .all()
    )
    return DocumentListResponse(
        documents=[DocumentResponse.model_validate(d) for d in docs],
        total=len(docs),
    )


@router.post("/upload", response_model=UploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Upload a PDF document and trigger asynchronous text ingestion."""
    logger.info(f"Document upload started: original_filename={file.filename}, user_id={current_user.id}")
    # 1. Resolve and validate directory paths to prevent traversal
    upload_dir = Path(settings.UPLOAD_DIR).resolve()
    upload_dir.mkdir(parents=True, exist_ok=True)

    # Force storage filename to strictly use UUID with .pdf extension
    unique_filename = f"{uuid.uuid4()}.pdf"
    file_path = (upload_dir / unique_filename).resolve()

    if not str(file_path).startswith(str(upload_dir)):
        logger.error(f"Document upload failed: path traversal detected in original_filename={file.filename}, user_id={current_user.id}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid destination path.",
        )

    # 2. Stream, validate size & magic bytes, and write to disk
    try:
        file_size = await stream_validate_and_save(file, str(file_path), MAX_UPLOAD_BYTES)
    except HTTPException as e:
        logger.error(f"Document upload failed: validation error for original_filename={file.filename}, user_id={current_user.id}. Error: {e.detail}")
        raise e
    except Exception as e:
        logger.error(f"Document upload failed: saving file to disk error for original_filename={file.filename}, user_id={current_user.id}. Error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An error occurred while uploading the file.",
        )

    # 3. Structural Validation (Verifying fitz can read/parse pages)
    try:
        validate_pdf_structure(str(file_path))
    except Exception as e:
        logger.error(f"Document upload failed: PDF structural validation failed for original_filename={file.filename}, user_id={current_user.id}. Error: {str(e)}")
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
            except OSError:
                pass
        raise e

    # 4. Filename Sanitization to prevent XSS / path traversal in DB metadata
    sanitized_original_filename = sanitize_filename(file.filename)

    # 5. Store metadata in database (status="processing")
    try:
        document = Document(
            user_id=current_user.id,
            filename=unique_filename,
            original_filename=sanitized_original_filename,
            file_size=file_size,
            storage_path=str(file_path),
            status="processing",
        )
        db.add(document)
        db.commit()
        db.refresh(document)
    except Exception as e:
        logger.error(f"Document upload failed: database error for original_filename={file.filename}, user_id={current_user.id}. Error: {str(e)}")
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
            except OSError:
                pass
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save document metadata."
        )

    logger.info(f"Document upload completed: document_id={document.id}, user_id={current_user.id}, storage_name={unique_filename}, file_size={file_size}")

    # Trigger document ingestion pipeline asynchronously
    background_tasks.add_task(ingest_document, db, document.id)

    return UploadResponse(
        id=document.id,
        status=document.status,
    )



@router.get("/{document_id}/file")
@router.get("/{document_id}/download")
def get_document_file(
    document_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Serve the PDF file associated with a document_id safely."""
    validate_uuid(document_id, "document_id")
    from fastapi.responses import FileResponse
    document = (
        db.query(Document)
        .filter(Document.id == document_id, Document.user_id == current_user.id)
        .first()
    )
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found",
        )

    if not os.path.exists(document.storage_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="PDF file not found on disk",
        )

    return FileResponse(document.storage_path, media_type="application/pdf")


@router.delete("/{document_id}", status_code=status.HTTP_200_OK)
def delete_document(
    document_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete a document — removes the file from disk and the database record."""
    validate_uuid(document_id, "document_id")
    document = (
        db.query(Document)
        .filter(Document.id == document_id, Document.user_id == current_user.id)
        .first()
    )
    if not document:
        logger.warning(f"Document deletion failed: document_id={document_id} not found or not owned by user_id={current_user.id}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found",
        )

    # Delete file from disk
    storage_path = document.storage_path
    try:
        if os.path.exists(storage_path):
            os.remove(storage_path)
            logger.info(f"Deleted document file from disk: {storage_path}")
    except OSError as e:
        logger.error(f"Failed to delete document file from disk: {storage_path}. Error: {str(e)}")

    # Delete database record
    try:
        db.delete(document)
        db.commit()
        logger.info(f"Document deletion completed: document_id={document_id}, user_id={current_user.id}")
    except Exception as e:
        logger.error(f"Document deletion database failed: document_id={document_id}, user_id={current_user.id}. Error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete document from database."
        )

    return {"message": "Document deleted successfully"}
