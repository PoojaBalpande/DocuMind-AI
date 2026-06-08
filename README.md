# DocuMind AI

> Enterprise-grade AI-powered document intelligence platform built with FastAPI, Next.js, PostgreSQL, pgvector, Hugging Face embeddings, and Ollama. Upload PDFs, chat with your knowledge base, retrieve grounded answers with citations, and prevent hallucinations through Retrieval-Augmented Generation (RAG).

---

## Features

### Authentication & Security

* JWT Authentication
* Password Hashing (bcrypt)
* Protected Dashboard Routes
* User Session Persistence

### Knowledge Base

* PDF Upload & Storage
* Automatic PDF Text Extraction (PyMuPDF)
* Intelligent Document Chunking
* Background Processing Pipeline
* Multi-document Knowledge Base

### AI & RAG Engine

* Local Embeddings using Hugging Face (`BAAI/bge-small-en-v1.5`)
* PostgreSQL + pgvector Vector Database
* Semantic Similarity Search
* Retrieval-Augmented Generation (RAG)
* Local LLM via Ollama
* Source Citations
* Hallucination Prevention

### Chat Experience

* Persistent Chat Sessions
* Citation Cards
* Chat History
* Context-Aware Document Question Answering

---

# Architecture

```text
User Uploads PDF
        │
        ▼
   PyMuPDF
(Text Extraction)
        │
        ▼
 Chunking Service
        │
        ▼
 HuggingFace Embeddings
 (BAAI/bge-small-en-v1.5)
        │
        ▼
 PostgreSQL + pgvector
        │
        ▼
 Similarity Retrieval
        │
        ▼
 Ollama (Qwen 2.5 / Qwen 3)
        │
        ▼
 Grounded AI Response
        │
        ▼
 Source Citations
```

---

# Tech Stack

| Layer            | Technology                          |
| ---------------- | ----------------------------------- |
| Frontend         | Next.js 16, TypeScript, TailwindCSS |
| State Management | Zustand                             |
| Backend          | FastAPI                             |
| Database         | PostgreSQL 17                       |
| Vector Database  | pgvector                            |
| ORM              | SQLAlchemy                          |
| Migrations       | Alembic                             |
| Authentication   | JWT + bcrypt                        |
| PDF Processing   | PyMuPDF                             |
| Embeddings       | Hugging Face BAAI/bge-small-en-v1.5 |
| Local LLM        | Ollama                              |
| Models           | Qwen 2.5 3B, Qwen 3 8B              |
| Testing          | Pytest                              |
| CI/CD            | GitHub Actions                      |

---

# Project Structure

```text
DocuMind AI/
├── frontend/
│   ├── app/
│   ├── components/
│   ├── stores/
│   ├── services/
│   ├── hooks/
│   └── types/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   │   ├── document_processor/
│   │   │   └── rag/
│   │   └── main.py
│   │
│   ├── alembic/
│   ├── uploads/
│   └── tests/
│
├── docs/
├── .github/workflows/
└── README.md
```

---

# Getting Started

## 1. Clone Repository

```bash
git clone <repository-url>
cd DocuMind-AI
```

## 2. Backend Setup

```bash
cd backend

python -m venv .venv

.venv\Scripts\activate

pip install -r requirements.txt
```

Create `.env`

```env
DATABASE_URL=postgresql://postgres:password@localhost:5433/documind_ai

SECRET_KEY=your-secret-key

OLLAMA_BASE_URL=http://localhost:11434

OLLAMA_MODEL=qwen2.5:3b
```

Run migrations:

```bash
alembic upgrade head
```

Start backend:

```bash
uvicorn app.main:app --reload --port 8001
```

---

## 3. Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

Frontend:

```text
http://localhost:3000
```

Backend Docs:

```text
http://127.0.0.1:8001/api/docs
```

---

# Verification

Successful End-to-End Verification:

* User Registration ✓
* User Login ✓
* PDF Upload ✓
* PDF Processing ✓
* Chunk Creation ✓
* Vector Storage ✓
* Semantic Retrieval ✓
* Grounded Answer Generation ✓
* Source Citations ✓
* Hallucination Prevention ✓

Example:

Question:

```text
What are Anushree's technical skills?
```

Answer:

```text
Programming Languages: Python, JavaScript

Machine Learning & NLP:
Scikit-Learn, SpaCy, NLTK,
TF-IDF, Hugging Face Transformers
```

Sources:

```text
Anushree_Kale_Resume.pdf
Page 1
```

---

# Roadmap

## Version 3.5 (Completed)

* [x] Authentication
* [x] PostgreSQL Integration
* [x] pgvector
* [x] PDF Uploads
* [x] Local Embeddings
* [x] Ollama Integration
* [x] Source Citations
* [x] Hallucination Prevention

## Version 4.0 (In Progress)

* [ ] Real-Time Streaming Responses
* [ ] PDF Viewer
* [ ] Enhanced Citation Experience
* [ ] Improved Chat UX

## Version 4.1 (Planned)

* [ ] Hybrid Search (Vector + BM25)
* [ ] Document Highlighting
* [ ] Conversation Memory
* [ ] Analytics Dashboard

---

# License

MIT License

© 2026 DocuMind AI
