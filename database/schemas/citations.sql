-- DocuMind AI — Citations Table

-- CREATE TABLE citations (
--     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--     message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
--     chunk_id UUID REFERENCES document_chunks(id) ON DELETE SET NULL,
--     document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
--     document_title VARCHAR(500),
--     page_number INTEGER,
--     excerpt TEXT,
--     relevance_score FLOAT,
--     created_at TIMESTAMPTZ DEFAULT NOW()
-- );

-- CREATE INDEX idx_citations_message_id ON citations(message_id);
