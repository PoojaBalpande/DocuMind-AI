# Local AI Stack Setup Guide (Version 3.5)

This guide documents how to set up and run **DocuMind AI** completely offline using a local embedding model and local LLM.

## Prerequisites

1. **Python 3.10+** (with virtual environment configured)
2. **PostgreSQL 15+** with the `pgvector` extension installed
3. **Node.js 18+** & **npm**

---

## Step 1: Install and Configure Ollama

Ollama is used to run LLMs locally.

1. Download and install Ollama from [ollama.com](https://ollama.com).
2. Once installed, start the Ollama application or run:
   ```bash
   ollama serve
   ```
3. Pull the required primary LLM model (`qwen3:8b`):
   ```bash
   ollama pull qwen3:8b
   ```
4. (Optional) Pull the fallback LLM model (`llama3.1:8b`):
   ```bash
   ollama pull llama3.1:8b
   ```

---

## Step 2: Configure Environment Variables

1. Navigate to the `backend/` directory.
2. Ensure the `.env` file contains the local Ollama configurations and comments out the OpenAI API keys:
   ```env
   # PostgreSQL database connection
   DATABASE_URL=postgresql://postgres:Sadhana@localhost:5433/documind_ai
   SECRET_KEY=documind_ai_super_secret_key_2026
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30

   # Local AI Settings
   OLLAMA_BASE_URL=http://localhost:11434
   OLLAMA_MODEL=qwen3:8b
   ```

---

## Step 3: Install Backend Dependencies

1. Navigate to the `backend/` directory.
2. Activate your virtual environment and install the required dependencies (specifically `sentence-transformers`):
   ```bash
   # On Windows (PowerShell):
   .venv\Scripts\Activate.ps1
   
   # Set Python encoding to UTF-8 to prevent cp1252 installation errors:
   $env:PYTHONUTF8="1"
   
   # Install dependencies:
   pip install -r requirements.txt --prefer-binary
   ```

---

## Step 4: Run Database Migrations

Since we migrated the vector database column dimension from 1536 to 384 (for `BAAI/bge-small-en-v1.5`), you must apply the Alembic migration.

> [!WARNING]
> This migration truncates the `document_chunks` table to prevent type errors. Old documents must be re-uploaded.

Run the migrations in the `backend/` folder:
```bash
.venv\Scripts\python.exe -m alembic upgrade head
```

---

## Step 5: Start the Application

### Backend
From the `backend/` directory:
```bash
.venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend
From the `frontend/` directory:
```bash
npm install
npm run dev
```

---

## Step 6: Verify the Local Flow

1. **Upload Document:** Go to the UI, upload a PDF document. Ensure it successfully goes from `Uploading` $\rightarrow$ `Processing` $\rightarrow$ `Ready`.
2. **Database Verification:**
   Verify that chunks are being generated and populated in the database:
   ```bash
   .venv\Scripts\python.exe -c "from app.core.database import SessionLocal; from app.models.document_chunk import DocumentChunk; db = SessionLocal(); print('Chunk count:', db.query(DocumentChunk).count())"
   ```
3. **Strict Grounding Test:**
   * Ask questions answered within the PDF $\rightarrow$ Check if local citations and answers are generated.
   * Ask questions unrelated to the document $\rightarrow$ Confirm the system responds:
     *"I could not find this information in the uploaded documents."*
