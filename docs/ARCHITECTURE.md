# DocuMind AI — Architecture Documentation

## System Architecture
DocuMind AI follows a modern three-tier architecture:

1. **Frontend** — Next.js 15 (App Router) with TailwindCSS
2. **Backend** — FastAPI (Python) with async support
3. **Database** — PostgreSQL with pgvector for embeddings

## RAG Pipeline
The Retrieval-Augmented Generation pipeline:
1. Document Upload → PDF/DOCX parsing
2. Text Splitting → Recursive character splitting
3. Embedding → OpenAI text-embedding-3-small
4. Storage → pgvector in PostgreSQL
5. Retrieval → Cosine similarity search
6. Generation → GPT-4o / Claude with cited sources

## API Design
RESTful API with OpenAPI documentation at `/api/docs`.

## Deployment
- Frontend: Vercel
- Backend: Render
- Database: Neon PostgreSQL
