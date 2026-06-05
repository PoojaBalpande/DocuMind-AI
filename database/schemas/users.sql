-- DocuMind AI — Users Table
-- PostgreSQL schema for user accounts

-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- CREATE TABLE users (
--     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--     email VARCHAR(255) UNIQUE NOT NULL,
--     password_hash VARCHAR(255) NOT NULL,
--     first_name VARCHAR(100),
--     last_name VARCHAR(100),
--     avatar_url TEXT,
--     role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'editor', 'viewer')),
--     company VARCHAR(255),
--     company_size VARCHAR(20),
--     subscription_tier VARCHAR(20) DEFAULT 'starter' CHECK (subscription_tier IN ('starter', 'precision', 'enterprise')),
--     is_active BOOLEAN DEFAULT true,
--     is_verified BOOLEAN DEFAULT false,
--     two_factor_enabled BOOLEAN DEFAULT false,
--     last_login_at TIMESTAMPTZ,
--     created_at TIMESTAMPTZ DEFAULT NOW(),
--     updated_at TIMESTAMPTZ DEFAULT NOW()
-- );

-- CREATE INDEX idx_users_email ON users(email);
-- CREATE INDEX idx_users_role ON users(role);
