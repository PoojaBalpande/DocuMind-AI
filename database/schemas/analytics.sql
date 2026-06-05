-- DocuMind AI — Analytics Table

-- CREATE TABLE analytics (
--     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--     user_id UUID REFERENCES users(id) ON DELETE SET NULL,
--     event_type VARCHAR(50) NOT NULL,
--     event_data JSONB DEFAULT '{}',
--     session_id UUID,
--     document_id UUID,
--     ip_address INET,
--     user_agent TEXT,
--     created_at TIMESTAMPTZ DEFAULT NOW()
-- );

-- CREATE INDEX idx_analytics_user_id ON analytics(user_id);
-- CREATE INDEX idx_analytics_event_type ON analytics(event_type);
-- CREATE INDEX idx_analytics_created_at ON analytics(created_at DESC);
