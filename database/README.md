# DocuMind AI — Database

## Overview
PostgreSQL database with pgvector extension for embedding storage.

## Schemas
- `users.sql` — User accounts and profiles
- `documents.sql` — Uploaded documents metadata
- `document_chunks.sql` — Text chunks with vector embeddings (pgvector)
- `chat_sessions.sql` — AI chat conversation sessions
- `messages.sql` — Individual chat messages
- `citations.sql` — Source citations linking messages to document chunks
- `analytics.sql` — User activity and system analytics events

## Migrations
Managed by Alembic (to be configured with backend).

## Seeds
Sample data for development and testing (to be added).

## Setup
```bash
# Future: Run migrations
cd backend
alembic upgrade head
```
