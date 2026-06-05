-- DocuMind AI — Chat Sessions Table

-- CREATE TABLE chat_sessions (
--     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--     user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
--     title VARCHAR(255) NOT NULL DEFAULT 'New Chat',
--     document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
--     model VARCHAR(50) DEFAULT 'gpt-4o',
--     is_pinned BOOLEAN DEFAULT false,
--     last_message_at TIMESTAMPTZ,
--     created_at TIMESTAMPTZ DEFAULT NOW(),
--     updated_at TIMESTAMPTZ DEFAULT NOW()
-- );

-- CREATE INDEX idx_sessions_user_id ON chat_sessions(user_id);
-- CREATE INDEX idx_sessions_last_message ON chat_sessions(last_message_at DESC);
