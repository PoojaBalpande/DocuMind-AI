# DocuMind AI — Production Deployment Guide

> Complete guide for deploying DocuMind AI to **Vercel** (frontend), **Render** (backend), and **Neon PostgreSQL** (database).

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Neon PostgreSQL Setup](#1-neon-postgresql-setup)
3. [Run Database Migrations](#2-run-database-migrations)
4. [Render Backend Deployment](#3-render-backend-deployment)
5. [Vercel Frontend Deployment](#4-vercel-frontend-deployment)
6. [Google OAuth Configuration](#5-google-oauth-configuration)
7. [Environment Variable Reference](#6-environment-variable-reference)
8. [Post-Deployment Verification](#7-post-deployment-verification)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before starting, ensure you have:

- [ ] **GitHub repository** — Code pushed to a GitHub repo
- [ ] **Neon account** — [neon.tech](https://neon.tech) (free tier available)
- [ ] **Render account** — [render.com](https://render.com) (free tier available)
- [ ] **Vercel account** — [vercel.com](https://vercel.com) (free tier available)
- [ ] **Google Cloud Console** — [console.cloud.google.com](https://console.cloud.google.com) (for OAuth)
- [ ] **Python 3.11+** installed locally (for running Alembic migrations)

---

## 1. Neon PostgreSQL Setup

### Create Database

1. Log in to [Neon Console](https://console.neon.tech)
2. Click **New Project**
3. Set:
   - **Project name**: `documind-ai`
   - **Region**: Choose closest to your Render region (e.g., `us-east-2`)
   - **PostgreSQL version**: `16`
4. Click **Create Project**

### Enable pgvector Extension

Connect to your database using the **SQL Editor** in Neon Console and run:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### Get Connection String

1. Go to **Dashboard** → **Connection Details**
2. Copy the connection string. It will look like:

```
postgresql://username:password@ep-cool-name-123456.us-east-2.aws.neon.tech/documind_ai?sslmode=require
```

> **Important**: Keep `?sslmode=require` — Neon requires SSL connections.

---

## 2. Run Database Migrations

Run Alembic migrations from your **local machine** against the Neon database.

### Option A: Direct Environment Variable

```bash
cd backend

# Set the Neon DATABASE_URL temporarily
export DATABASE_URL="postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/documind_ai?sslmode=require"
export SECRET_KEY="any-temporary-key-at-least-32-characters-long"

# Run migrations
alembic upgrade head
```

### Option B: Using .env File

1. Create a temporary `.env` in `backend/`:

```env
DATABASE_URL=postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/documind_ai?sslmode=require
SECRET_KEY=temporary-key-at-least-32-characters-long-here
ENVIRONMENT=production
GOOGLE_CLIENT_ID=your-real-google-client-id.apps.googleusercontent.com
```

2. Run migrations:

```bash
cd backend
alembic upgrade head
```

3. **Delete or revert** the temporary `.env` after migration.

### Verify Migration

In the Neon SQL Editor, confirm tables exist:

```sql
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
```

You should see: `users`, `documents`, `document_chunks`, `chat_sessions`, `messages`, `user_settings`, `alembic_version`.

---

## 3. Render Backend Deployment

### Create Web Service

1. Log in to [Render Dashboard](https://dashboard.render.com)
2. Click **New** → **Web Service**
3. Connect your GitHub repository
4. Configure:

| Setting | Value |
|---------|-------|
| **Name** | `documind-ai-api` |
| **Region** | Same as Neon (e.g., `US East`) |
| **Branch** | `main` (or your production branch) |
| **Root Directory** | `backend` |
| **Runtime** | `Python 3` |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |
| **Instance Type** | `Starter` or higher (512 MB+ RAM recommended for ML models) |

### Persistent Disk

The backend requires persistent storage for uploaded PDF files.

1. Go to your web service → **Disks**
2. Click **Add Disk**
3. Configure:

| Setting | Value |
|---------|-------|
| **Name** | `documind-storage` |
| **Mount Path** | `/data` |
| **Size** | `1 GB` (increase as needed) |

### Environment Variables

Go to **Environment** tab and add:

| Variable | Value | Notes |
|----------|-------|-------|
| `ENVIRONMENT` | `production` | Required |
| `DATABASE_URL` | `postgresql://...@ep-xxx.neon.tech/...?sslmode=require` | From Neon |
| `SECRET_KEY` | *(generate with `python -c "import secrets; print(secrets.token_urlsafe(64))"`)* | Required, 64+ chars |
| `GOOGLE_CLIENT_ID` | `your-id.apps.googleusercontent.com` | From Google Console |
| `CORS_ORIGINS` | `["https://your-app.vercel.app"]` | Your Vercel domain |
| `COOKIE_SECURE` | `True` | Required for HTTPS |
| `COOKIE_SAMESITE` | `lax` | Required for cross-origin |
| `UPLOAD_DIR` | `/data/uploads` | Must match persistent disk mount |
| `OLLAMA_BASE_URL` | `http://your-ollama-host:11434` | See LLM note below |
| `OLLAMA_MODEL` | `qwen3:8b` | Or your preferred model |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `30` | Default is fine |

> **LLM Note**: Render does not natively support running Ollama. You need one of:
> - A separate VM/VPS running Ollama with a public endpoint
> - An OpenAI-compatible API provider (set `OPENAI_API_KEY` and modify `llm_service.py`)
> - A GPU cloud service (e.g., RunPod, Lambda Labs) running Ollama

### Deploy

Click **Create Web Service**. Render will build and deploy automatically.

Note your backend URL (e.g., `https://documind-ai-api.onrender.com`).

---

## 4. Vercel Frontend Deployment

### Import Project

1. Log in to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Add New** → **Project**
3. Import your GitHub repository
4. Configure:

| Setting | Value |
|---------|-------|
| **Framework Preset** | `Next.js` |
| **Root Directory** | `frontend` |
| **Build Command** | `next build` (default) |
| **Output Directory** | `.next` (default) |

### Environment Variables

Add in **Settings** → **Environment Variables**:

| Variable | Value | Environment |
|----------|-------|-------------|
| `NEXT_PUBLIC_API_URL` | `https://documind-ai-api.onrender.com` | Production |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | `your-id.apps.googleusercontent.com` | Production |

> **Important**: `NEXT_PUBLIC_*` variables are embedded at **build time**. If you change them, you must redeploy.

### Deploy

Click **Deploy**. Note your frontend URL (e.g., `https://documind-ai.vercel.app`).

### Update Backend CORS

After deployment, go back to Render and update `CORS_ORIGINS` with your actual Vercel URL:

```
["https://documind-ai.vercel.app"]
```

If you have a custom domain, include both:

```
["https://documind-ai.vercel.app","https://www.yourdomain.com"]
```

---

## 5. Google OAuth Configuration

### Create OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select or create a project
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure:

| Setting | Value |
|---------|-------|
| **Application type** | `Web application` |
| **Name** | `DocuMind AI` |
| **Authorized JavaScript origins** | `https://your-app.vercel.app` |
| **Authorized redirect URIs** | `https://your-app.vercel.app/auth-callback` |

6. Click **Create** and copy the **Client ID**

### Configure OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Set:
   - **App name**: `DocuMind AI`
   - **User support email**: Your email
   - **Authorized domains**: `vercel.app` (and your custom domain)
3. Add scopes: `openid`, `email`, `profile`
4. For public access, submit for **verification** (required for external users)

### Set Client ID

Use the **same Client ID** in both:
- Render: `GOOGLE_CLIENT_ID` environment variable
- Vercel: `NEXT_PUBLIC_GOOGLE_CLIENT_ID` environment variable

---

## 6. Environment Variable Reference

### Backend (Render) — Complete Checklist

| Variable | Required | Default | Production Value |
|----------|----------|---------|-----------------|
| `ENVIRONMENT` | ✅ | `development` | `production` |
| `DATABASE_URL` | ✅ | — | Neon connection string |
| `SECRET_KEY` | ✅ | — | Random 64+ char string |
| `GOOGLE_CLIENT_ID` | ✅ (prod) | `""` | OAuth Client ID |
| `CORS_ORIGINS` | ✅ (prod) | `["http://localhost:3000"]` | `["https://your-app.vercel.app"]` |
| `COOKIE_SECURE` | ⚙️ | `True` | `True` |
| `COOKIE_SAMESITE` | ⚙️ | `lax` | `lax` |
| `COOKIE_DOMAIN` | ⚙️ | `""` | `""` (leave empty for Render→Vercel) |
| `UPLOAD_DIR` | ⚙️ | `./uploads` | `/data/uploads` (persistent disk) |
| `MAX_UPLOAD_SIZE_MB` | ⚙️ | `50` | `50` |
| `OLLAMA_BASE_URL` | ⚙️ | `http://127.0.0.1:11434` | Your Ollama endpoint |
| `OLLAMA_MODEL` | ⚙️ | `qwen3:8b` | Your model name |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | ⚙️ | `30` | `30` |
| `ALGORITHM` | ⚙️ | `HS256` | `HS256` |

### Frontend (Vercel) — Complete Checklist

| Variable | Required | Default | Production Value |
|----------|----------|---------|-----------------|
| `NEXT_PUBLIC_API_URL` | ✅ | `http://localhost:8000` | `https://your-api.onrender.com` |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | ✅ | — | OAuth Client ID |

### Database (Neon) — Setup Checklist

| Item | Status |
|------|--------|
| Project created | ☐ |
| pgvector extension enabled | ☐ |
| Connection string obtained | ☐ |
| Alembic migrations applied | ☐ |
| Tables verified | ☐ |

---

## 7. Post-Deployment Verification

Run through this checklist after deployment:

### Health Check

```bash
curl https://your-api.onrender.com/api/health
```

Expected response:
```json
{"status": "healthy", "version": "2.0.0", "app": "DocuMind AI"}
```

### Authentication Flow

1. Open `https://your-app.vercel.app`
2. Navigate to **Sign Up** → Create a new account
3. Verify redirect to dashboard
4. **Logout** → Verify redirect to login
5. **Login** → Verify access to dashboard
6. **Google Sign In** → Verify Google OAuth flow works

### Document Upload

1. Upload a small PDF document
2. Verify status changes from `processing` to `ready`
3. Open the document in the chat interface
4. Ask a question about the document content

### Cookie Verification

1. Open browser DevTools → **Application** → **Cookies**
2. Verify `access_token` cookie has:
   - `HttpOnly`: ✅
   - `Secure`: ✅
   - `SameSite`: `Lax`
   - `Path`: `/`

### API Docs Disabled

Verify that `https://your-api.onrender.com/api/docs` returns **404** in production.

---

## Troubleshooting

### CORS Errors

**Symptom**: Browser console shows `Access-Control-Allow-Origin` errors.

**Fix**: Verify `CORS_ORIGINS` on Render includes your exact Vercel URL (including `https://`). Must be a JSON array:
```
["https://your-app.vercel.app"]
```

### Cookies Not Being Set

**Symptom**: Login succeeds but user is immediately logged out.

**Fix**:
1. Ensure `COOKIE_SECURE=True` (Render uses HTTPS)
2. Ensure `COOKIE_SAMESITE=lax` (not `strict` for cross-origin)
3. Verify frontend uses `credentials: 'include'` in all fetch calls
4. Verify CORS allows credentials (`allow_credentials=True`)

### Database Connection Errors

**Symptom**: `connection refused` or SSL errors.

**Fix**:
1. Verify `DATABASE_URL` includes `?sslmode=require`
2. Check Neon dashboard for connection limits
3. Verify the database is in the same region as Render

### Embedding Model Download Fails

**Symptom**: Startup crashes with `sentence-transformers` error.

**Fix**: The `BAAI/bge-small-en-v1.5` model (~130 MB) downloads on first startup. Ensure:
1. Render instance has sufficient disk space
2. Build/startup has internet access
3. First cold start may take 2-3 minutes

### Startup Validation Errors

**Symptom**: App crashes immediately with `Startup configuration errors`.

**Fix**: Check the error message carefully. Common causes:
- `SECRET_KEY` is missing or too short (minimum 32 chars)
- `DATABASE_URL` is missing
- `GOOGLE_CLIENT_ID` is missing in production mode
- `CORS_ORIGINS` contains `*` in production mode

### Google OAuth Fails

**Symptom**: Google popup opens but login fails.

**Fix**:
1. Verify `GOOGLE_CLIENT_ID` matches between frontend and backend
2. Verify **Authorized JavaScript origins** in Google Console includes your Vercel URL
3. Verify **Authorized redirect URIs** includes `https://your-app.vercel.app/auth-callback`
4. If app is not verified, only test users can sign in

---

## Architecture Overview

```
┌──────────────────┐     HTTPS      ┌──────────────────┐     SSL      ┌──────────────────┐
│                  │ ──────────────→ │                  │ ──────────→ │                  │
│   Vercel         │                 │   Render         │              │   Neon           │
│   (Next.js)      │ ←────────────── │   (FastAPI)      │ ←────────── │   (PostgreSQL    │
│                  │   JSON + Cookie │                  │   pgvector  │    + pgvector)   │
└──────────────────┘                 └──────────────────┘              └──────────────────┘
  NEXT_PUBLIC_API_URL →                ← CORS_ORIGINS                   ← DATABASE_URL
  NEXT_PUBLIC_GOOGLE_CLIENT_ID         COOKIE_SECURE=True
                                       COOKIE_SAMESITE=lax
                                       ┌────────────────┐
                                       │ Persistent Disk │
                                       │   /data/uploads │
                                       └────────────────┘
```
