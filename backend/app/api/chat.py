"""Chat API endpoints — session management (no AI yet)."""

from datetime import datetime, timezone
from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.chat import ChatSession, Message
from app.schemas.chat import (
    ChatSessionCreate,
    ChatSessionUpdate,
    ChatSessionResponse,
    ChatAskRequest,
    ChatAskResponse,
    MessageResponse,
)
from app.services.rag.rag_pipeline import run_rag_pipeline

router = APIRouter()


@router.get("/sessions", response_model=list[ChatSessionResponse])
def list_sessions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List all chat sessions for the authenticated user."""
    sessions = (
        db.query(ChatSession)
        .filter(ChatSession.user_id == current_user.id, ChatSession.is_deleted == False)
        .order_by(ChatSession.updated_at.desc())
        .all()
    )
    return [ChatSessionResponse.model_validate(s) for s in sessions]


@router.post("/session", response_model=ChatSessionResponse, status_code=status.HTTP_201_CREATED)
def create_session(
    data: ChatSessionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new chat session."""
    session = ChatSession(
        user_id=current_user.id,
        title=data.title,
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return ChatSessionResponse.model_validate(session)


@router.post("/ask", response_model=ChatAskResponse)
def ask_question(
    data: ChatAskRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Ask a question grounded in the user's uploaded documents."""
    session = (
        db.query(ChatSession)
        .filter(
            ChatSession.id == data.session_id,
            ChatSession.user_id == current_user.id,
            ChatSession.is_deleted == False
        )
        .first()
    )
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat session not found",
        )

    # Auto-generate title if it's currently "New Chat"
    if session.title == "New Chat":
        new_title = data.message.strip()
        if len(new_title) > 40:
            new_title = new_title[:37] + "..."
        session.title = new_title
    session.updated_at = datetime.now(timezone.utc)

    # Resolve document_ids (supporting both singular and plural for backward compatibility)
    doc_ids = data.document_ids
    if doc_ids is None and data.document_id is not None:
        doc_ids = [data.document_id]

    # 2. Run the RAG pipeline (V8 Phase 2: pass document_ids list for retrieval mode control)
    result = run_rag_pipeline(db, current_user.id, data.message, document_ids=doc_ids)

    # 3. Store the user's query
    user_message = Message(
        session_id=session.id,
        role="user",
        content=data.message,
    )
    db.add(user_message)

    # 4. Store the assistant's answer with citations and reasoning metadata
    reasoning_metadata = {
        "reasoning_intent": result.get("reasoning_intent"),
        "document_contributions": result.get("document_contributions"),
    }
    assistant_message = Message(
        session_id=session.id,
        role="assistant",
        content=result["answer"],
        citations=result["sources"],
        reasoning_metadata=reasoning_metadata,
    )
    db.add(assistant_message)

    # 5. Commit messages to DB
    db.commit()

    return ChatAskResponse(
        answer=result["answer"],
        sources=result["sources"],
        reasoning_intent=result.get("reasoning_intent"),
        document_contributions=result.get("document_contributions"),
    )


@router.post("/stream")
def ask_question_stream(
    data: ChatAskRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Ask a question grounded in the user's uploaded documents and stream the response."""
    from fastapi.responses import StreamingResponse
    import json
    import requests
    from app.core.config import settings
    from app.models.chat import Message
    from app.services.rag.retriever import retrieve_relevant_chunks
    from app.services.reasoning import (
        detect_reasoning_intent,
        format_document_context,
        build_reasoning_prompt,
        build_document_contributions,
    )

    session = (
        db.query(ChatSession)
        .filter(
            ChatSession.id == data.session_id,
            ChatSession.user_id == current_user.id,
            ChatSession.is_deleted == False
        )
        .first()
    )
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat session not found",
        )

    # Auto-generate title if it's currently "New Chat"
    if session.title == "New Chat":
        new_title = data.message.strip()
        if len(new_title) > 40:
            new_title = new_title[:37] + "..."
        session.title = new_title
    session.updated_at = datetime.now(timezone.utc)

    # Resolve document_ids (supporting both singular and plural for backward compatibility)
    doc_ids = data.document_ids
    if doc_ids is None and data.document_id is not None:
        doc_ids = [data.document_id]

    # 2. Retrieve top chunks using user-configured settings
    from app.services.settings_service import SettingsService
    user_settings = SettingsService.get_or_create_settings(db, current_user.id)
    limit = user_settings.retrieval_top_k
    chunks = retrieve_relevant_chunks(
        db, current_user.id, data.message, limit=limit, document_ids=doc_ids
    )

    print("===== RETRIEVED CHUNKS =====")
    for chunk in chunks:
        print(chunk)

    # 3. Format citations with enriched metadata (V8: chunk_id + similarity_score)
    sources = []
    for chunk in chunks:
        sources.append({
            "document": chunk["document"],
            "document_id": chunk["document_id"],
            "page": chunk["page"],
            "snippet": chunk["content"],
            "chunk_id": chunk.get("chunk_id"),
            "similarity_score": chunk.get("similarity_score"),
        })

    # 4. Detect intent, format context, build prompt, and track contributions
    intent = detect_reasoning_intent(data.message)
    context = format_document_context(chunks)

    print("===== FORMATTED CONTEXT =====")
    print(context)

    prompt = build_reasoning_prompt(intent, data.message, context)

    print("===== FINAL PROMPT =====")
    print(prompt)

    contributions = build_document_contributions(chunks)
    contributions_dump = [c.model_dump(mode="json") for c in contributions]

    def event_generator():
        # First send citations
        yield f"data: {json.dumps({'type': 'citations', 'citations': sources})}\n\n"

        # Send reasoning metadata for Phase 3/4 backward compatibility
        yield f"data: {json.dumps({
            'type': 'reasoning',
            'reasoning_intent': intent.value,
            'document_contributions': contributions_dump
        })}\n\n"

        if not chunks:
            fallback_ans = "I could not find this information in the uploaded documents."
            yield f"data: {json.dumps({'type': 'token', 'token': fallback_ans})}\n\n"
            
            # Store messages to DB
            user_message = Message(
                session_id=session.id,
                role="user",
                content=data.message,
            )
            db.add(user_message)
            
            reasoning_metadata = {
                "reasoning_intent": intent.value,
                "document_contributions": contributions_dump,
            }
            assistant_message = Message(
                session_id=session.id,
                role="assistant",
                content=fallback_ans,
                citations=[],
                reasoning_metadata=reasoning_metadata,
            )
            db.add(assistant_message)
            db.commit()
            return

        # 5. Generate stream from Ollama
        url = f"{settings.OLLAMA_BASE_URL}/api/chat"
        system_prompt = """You are DocuMind AI.

Answer only from the provided document context.

If the user asks for a summary, comparison, or synthesis of the documents (e.g. similarities or differences):
- Answer by synthesizing, comparing, or contrasting the facts and evidence present in the retrieved chunks.
- You are allowed and encouraged to infer similarities and differences from the retrieved evidence, even if they are not stated verbatim in a single sentence.

If the context does not contain enough information to address the question, or if you cannot answer the question or infer comparisons from the provided chunks, respond:
"I could not find this information in the uploaded documents."

Do not hallucinate.
Do not use external knowledge."""

        print("===== SYSTEM PROMPT SENT =====")
        print(system_prompt)

        print("===== USER PROMPT SENT =====")
        print(prompt)

        payload = {
            "model": settings.OLLAMA_MODEL,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            "stream": True,
            "options": {
                "temperature": user_settings.temperature,
                "num_predict": user_settings.max_tokens,
            }
        }

        full_answer = ""
        chunk_count = 0
        try:
            # Query Ollama model with stream=True
            response = requests.post(url, json=payload, stream=True, timeout=300)
            response.raise_for_status()
            for line in response.iter_lines(chunk_size=1):
                if line:
                    chunk_data = json.loads(line.decode("utf-8"))
                    token = chunk_data.get("message", {}).get("content", "")
                    full_answer += token
                    chunk_count += 1
                    print(f"[BACKEND STREAM] Sent chunk #{chunk_count}: '{token}'")
                    yield f"data: {json.dumps({'type': 'token', 'token': token})}\n\n"
            print(f"[BACKEND STREAM] Stream finished. Total chunks sent: {chunk_count}")
        except Exception as e:
            print(f"[BACKEND STREAM] Primary model failed: {e}. Trying fallback model...")
            # Try fallback model
            payload["model"] = "qwen2.5-coder:7b"
            fallback_chunk_count = 0
            try:
                response = requests.post(url, json=payload, stream=True, timeout=300)
                response.raise_for_status()
                for line in response.iter_lines(chunk_size=1):
                    if line:
                        chunk_data = json.loads(line.decode("utf-8"))
                        token = chunk_data.get("message", {}).get("content", "")
                        full_answer += token
                        fallback_chunk_count += 1
                        print(f"[BACKEND STREAM] Sent fallback chunk #{fallback_chunk_count}: '{token}'")
                        yield f"data: {json.dumps({'type': 'token', 'token': token})}\n\n"
                print(f"[BACKEND STREAM] Fallback stream finished. Total chunks sent: {fallback_chunk_count}")
            except Exception as fallback_e:
                print(f"[BACKEND STREAM] Fallback model failed: {fallback_e}")
                yield f"data: {json.dumps({'type': 'token', 'token': 'Error: Failed to retrieve answer from local RAG engine.'})}\n\n"
                return

        # 6. Store completed conversation in DB
        user_message = Message(
            session_id=session.id,
            role="user",
            content=data.message,
        )
        db.add(user_message)
        
        reasoning_metadata = {
            "reasoning_intent": intent.value,
            "document_contributions": contributions_dump,
        }
        assistant_message = Message(
            session_id=session.id,
            role="assistant",
            content=full_answer.strip(),
            citations=sources,
            reasoning_metadata=reasoning_metadata,
        )
        db.add(assistant_message)
        db.commit()

    return StreamingResponse(event_generator(), media_type="text/event-stream")


@router.get("/sessions/{session_id}/messages", response_model=list[MessageResponse])
def get_session_messages(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve chat history (messages) for a specific session."""
    # 1. Validate session ownership
    session = (
        db.query(ChatSession)
        .filter(
            ChatSession.id == session_id,
            ChatSession.user_id == current_user.id,
            ChatSession.is_deleted == False
        )
        .first()
    )
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat session not found",
        )

    # 2. Retrieve messages ordered by creation date
    messages = (
        db.query(Message)
        .filter(Message.session_id == session_id)
        .order_by(Message.created_at.asc())
        .all()
    )

    return [MessageResponse.model_validate(m) for m in messages]


@router.patch("/sessions/{session_id}", response_model=ChatSessionResponse)
def update_session(
    session_id: str,
    data: ChatSessionUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update (rename) a chat session."""
    session = (
        db.query(ChatSession)
        .filter(
            ChatSession.id == session_id,
            ChatSession.user_id == current_user.id,
            ChatSession.is_deleted == False
        )
        .first()
    )
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat session not found",
        )
    session.title = data.title
    session.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(session)
    return ChatSessionResponse.model_validate(session)


@router.delete("/sessions/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_session_endpoint(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Soft delete a chat session."""
    session = (
        db.query(ChatSession)
        .filter(
            ChatSession.id == session_id,
            ChatSession.user_id == current_user.id,
            ChatSession.is_deleted == False
        )
        .first()
    )
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat session not found",
        )
    session.is_deleted = True
    session.updated_at = datetime.now(timezone.utc)
    db.commit()
    return

