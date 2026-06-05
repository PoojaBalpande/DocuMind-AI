-- DocuMind AI — Document Chunks Table (for RAG/embeddings)

-- CREATE EXTENSION IF NOT EXISTS vector;

-- CREATE TABLE document_chunks (
--     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--     document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
--     chunk_index INTEGER NOT NULL,
--     content TEXT NOT NULL,
--     page_number INTEGER,
--     embedding vector(1536),
--     token_count INTEGER,
--     metadata JSONB DEFAULT '{}',
--     created_at TIMESTAMPTZ DEFAULT NOW()
-- );

-- CREATE INDEX idx_chunks_document_id ON document_chunks(document_id);
-- CREATE INDEX idx_chunks_embedding ON document_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
