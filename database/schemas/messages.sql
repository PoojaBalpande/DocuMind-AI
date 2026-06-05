-- DocuMind AI — Messages Table

-- CREATE TABLE messages (
--     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--     session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
--     role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
--     content TEXT NOT NULL,
--     token_count INTEGER,
--     model VARCHAR(50),
--     metadata JSONB DEFAULT '{}',
--     created_at TIMESTAMPTZ DEFAULT NOW()
-- );

-- CREATE INDEX idx_messages_session_id ON messages(session_id);
-- CREATE INDEX idx_messages_created_at ON messages(created_at);
