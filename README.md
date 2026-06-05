# DocuMind AI

> AI-powered document intelligence platform. Upload PDFs, chat with your knowledge base, extract insights with cited sources.

## Architecture

```
DocuMind AI/
├── frontend/          # Next.js 15 (App Router) — TypeScript, TailwindCSS v4
│   ├── app/           # Pages & routes (public + dashboard layouts)
│   ├── components/    # Reusable UI components
│   ├── stores/        # Zustand state management
│   ├── services/      # API service layer (mock → FastAPI)
│   ├── hooks/         # Custom React hooks
│   ├── lib/           # Theme, mock data, utilities
│   └── types/         # TypeScript interfaces
├── backend/           # FastAPI (Python) — placeholder
│   ├── app/
│   │   ├── api/       # REST endpoints
│   │   ├── core/      # Config, security
│   │   ├── models/    # SQLAlchemy ORM models
│   │   ├── schemas/   # Pydantic schemas
│   │   ├── services/  # Business logic + RAG pipeline
│   │   └── ...
│   └── requirements.txt
├── database/          # PostgreSQL + pgvector schemas
│   ├── schemas/       # SQL table definitions
│   ├── migrations/    # Alembic migrations
│   └── seeds/         # Development seed data
├── docs/              # Architecture documentation
├── tests/             # Integration tests
├── .github/workflows/ # CI/CD pipelines
└── docker-compose.yml # Container orchestration
```

## Getting Started

### Frontend
```bash
cd frontend
npm install
npm run dev        # → http://localhost:3000
```

### Quick Tour
| Route | Description |
|-------|-------------|
| `/` | Landing page with feature showcase |
| `/login` | Sign in (any email/password works) |
| `/signup` | Create account |
| `/pricing` | Plan comparison |
| `/dashboard` | System dashboard with metrics |
| `/chat` | AI chat with documents |
| `/documents` | Document management |
| `/settings` | Account settings |
| `/profile` | User profile |
| `/admin` | Analytics & user management |

## Design System

- **Theme**: Arctic Enterprise (Cold Winter Technology)
- **Colors**: Deep Navy (#0C2C55), Warm Beige (#EDEDCE), Sea Green (#2C6577)
- **Typography**: Inter
- **Effects**: Glassmorphism, inner-glow, soft shadows
- **Components**: Glass-panel cards, gradient buttons, pill badges

## Tech Stack

| Layer | Technology | Status |
|-------|-----------|--------|
| Frontend | Next.js 15 + TypeScript + TailwindCSS v4 | ✅ Active |
| State | Zustand | ✅ Active |
| Backend | FastAPI | 🔲 Scaffold |
| Database | PostgreSQL + pgvector | 🔲 Schema only |
| AI/LLM | OpenAI GPT-4o + LangChain | 🔲 RAG scaffold |
| Deploy | Vercel + Render + Neon | 🔲 CI ready |

## Roadmap

- [x] Monorepo structure
- [x] All 10 UI pages converted to React
- [x] Zustand state management
- [x] Mock data & service layer
- [x] Dark mode support
- [x] Protected routes
- [ ] FastAPI backend implementation
- [ ] PostgreSQL + pgvector integration
- [ ] RAG pipeline (document → embeddings → retrieval)
- [ ] Real authentication (OAuth, JWT)
- [ ] Production deployment

## License

Proprietary — © 2024 DocuMind AI
