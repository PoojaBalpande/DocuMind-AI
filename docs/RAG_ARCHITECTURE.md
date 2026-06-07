# DocuMind AI — RAG Engine Architecture (Version 3)

This document details the Retrieval-Augmented Generation (RAG) processing engine introduced in DocuMind AI Version 3, covering architecture diagrams, database schemas, and pipeline workflows.

---

## 1. System Architecture Diagram

The system coordinates the Next.js frontend, FastAPI backend, PostgreSQL database with the `pgvector` extension, and OpenAI API endpoints:

```mermaid
graph TD
    Client([React Next.js Client]) <-->|REST API + JWT| API[FastAPI Backend Router]
    API <-->|SQLAlchemy ORM| DB[(PostgreSQL + pgvector)]
    
    %% Ingestion Pipeline
    API --->|FastAPI BackgroundTasks| Ingest[Ingestion Pipeline]
    Ingest --->|1. Extract Pages| PyMuPDF[PyMuPDF / fitz]
    Ingest --->|2. Split Text| Splitter[LangChain Chunker]
    Ingest --->|3. Vectorize Chunks| OpenAI_Embed[OpenAI text-embedding-3-small]
    Ingest --->|4. Save Vectors| DB
    
    %% Query RAG Pipeline
    API <--->|RAG Pipeline| RAG[RAG Coordinator]
    RAG --->|1. Vectorize Query| OpenAI_Embed
    RAG --->|2. Cosine Distance Search| DB
    RAG --->|3. Compile Context| Prompt[Prompt Builder]
    Prompt --->|4. Generate Grounded Answer| GPT4o[OpenAI GPT-4o]
```

---

## 2. Data Flow Diagram

The step-by-step workflow for document processing and chat querying:

```mermaid
sequenceDiagram
    autonumber
    actor User as User
    participant FE as Next.js Frontend
    participant BE as FastAPI Backend
    participant Ext as PyMuPDF
    participant OpenAI as OpenAI API
    participant DB as PostgreSQL (pgvector)
    
    %% Ingestion Phase
    Note over User, DB: Ingestion Pipeline
    User->>FE: Upload PDF file
    FE->>BE: POST /api/documents/upload
    BE->>DB: Create Document Record (status='processing')
    BE-->>FE: Return UploadResponse (id, status='processing')
    Note right of BE: Ingestion starts in BackgroundTask
    BE->>Ext: Extract page texts (fitz.open)
    BE->>BE: Chunks text blocks (RecursiveCharacterTextSplitter)
    BE->>OpenAI: generate_embeddings (text-embedding-3-small)
    OpenAI-->>BE: Returns 1536-dim vectors
    BE->>DB: Store DocumentChunks with embeddings
    BE->>DB: Set status='ready'
    
    %% Querying Phase
    Note over User, DB: Retrieval & Generation Pipeline
    User->>FE: Type message in Chat Page
    FE->>BE: POST /api/chat/ask {session_id, message}
    BE->>OpenAI: generate_embedding (user message)
    OpenAI-->>BE: Returns vector
    BE->>DB: Similarity cosine distance search on DocumentChunks (Top 5)
    DB-->>BE: Returns nearest chunks with page/document metadata
    BE->>BE: Formats prompt context
    BE->>OpenAI: Completions request (GPT-4o)
    OpenAI-->>BE: Grounded response answer
    BE->>DB: Store user query message
    BE->>DB: Store assistant message with citations list
    BE-->>FE: Return ChatAskResponse {answer, sources}
    FE->>User: Display grounded answer + Clickable citation cards
```

---

## 3. Database Schema

The RAG platform extends the PostgreSQL schema with vector support:

```mermaid
erDiagram
    users ||--o{ documents : owns
    users ||--o{ chat_sessions : owns
    documents ||--o{ document_chunks : contains
    chat_sessions ||--o{ messages : contains
    
    users {
        string id PK
        string name
        string email
        string hashed_password
        boolean is_active
        boolean is_admin
        datetime created_at
    }
    
    documents {
        string id PK
        string user_id FK
        string filename
        string original_filename
        integer file_size
        string storage_path
        string status "uploading | processing | ready | failed"
        datetime created_at
    }
    
    document_chunks {
        string id PK
        string document_id FK
        integer chunk_index
        text content
        vector embedding "VECTOR(1536)"
        integer page_number
        datetime created_at
    }
    
    chat_sessions {
        string id PK
        string user_id FK
        string title
        datetime created_at
    }
    
    messages {
        string id PK
        string session_id FK
        string role "user | assistant | system"
        text content
        json citations "List of source citations"
        datetime created_at
    }
```

---

## 4. Pipeline Details

### Ingestion Workflow (PDF Processing Module)
* **Extraction (`pdf_loader.py`):** Uses PyMuPDF (`fitz`) to extract page-by-page text. Text is associated with its source page number (1-indexed) to preserve page numbers.
* **Chunking (`chunker.py`):** Utilizes LangChain's `RecursiveCharacterTextSplitter` configured with a chunk size of `1000` characters and an overlap of `200` characters. This ensures text segments are reasonably sized and contextual boundaries are maintained.
* **Vector Embeddings (`embedding_service.py`):** The OpenAI embedding model `text-embedding-3-small` creates 1536-dimensional vector representations of each text chunk.
* **Storage (`ingestion_service.py`):** Stores chunks directly in the `document_chunks` table, database writes are executed, and document status is updated to `ready`.

### Retrieval Workflow (`retriever.py`)
Similarity search is executed directly inside PostgreSQL using the pgvector operator `<=>` (cosine distance). The query returns the top 5 chunks closest to the user's question embedding:
```sql
SELECT dc.content, dc.page_number, d.original_filename
FROM document_chunks dc
JOIN documents d ON dc.document_id = d.id
WHERE d.user_id = :user_id
ORDER BY dc.embedding <=> :query_embedding
LIMIT 5;
```

### Generation Workflow (`llm_service.py` & `rag_pipeline.py`)
GPT-4o synthesizes the final response. It is strictly constrained by system prompts to ONLY answer questions using the formatted context. If the query cannot be resolved from the context, the system responds with:
> *"I couldn't find this information in the uploaded documents."*
