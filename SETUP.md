# NutriTrack Website — Setup & Run Guide

## Overview

The NutriTrack website consists of two services:
- **Frontend** (`fyp-project/`) — React Router v7 SSR app (Node 20)
- **Backend** (`backend/`) — FastAPI + PostgreSQL API (Python 3.11)

---

## Prerequisites

| Tool | Version | Install |
|---|---|---|
| Node.js | 20+ | https://nodejs.org |
| Python | 3.11+ | https://python.org |
| Docker + Docker Compose | Latest | https://docker.com |
| PostgreSQL | 16 (optional, Docker handles it) | https://postgresql.org |

---

## Option A — Docker Compose (Recommended)

Runs all three services (database, backend, frontend) with one command.

```bash
# Clone / enter the repo
cd G:\School\FYP\FYP-repo

# Copy and edit environment config (optional — defaults work for local dev)
cp backend/.env.example backend/.env

# Start all services
docker compose up --build

# In another terminal, seed the database with content
docker compose exec backend python scripts/seed.py

# Create your first admin user
docker compose exec backend python scripts/create_admin.py admin yourpassword
```

Services:
| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| API Docs | http://localhost:8000/docs |
| Admin Dashboard | http://localhost:3000/admin/login |

---

## Option B — Local Development (No Docker)

### 1. Start PostgreSQL

Create a database named `nutritrack` with user `nutritrack` / password `nutritrack_pass`, or update `backend/.env` with your own credentials.

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment config
cp .env.example .env
# Edit .env — set DATABASE_URL to your PostgreSQL connection string

# Run database migrations
alembic upgrade head

# Seed content (optional but recommended)
python scripts/seed.py

# Create an admin user
python scripts/create_admin.py admin yourpassword

# Start the API server
uvicorn app.main:app --reload --port 8000
```

Backend is now running at http://localhost:8000
API docs available at http://localhost:8000/docs

### 3. Frontend Setup

```bash
cd fyp-project

# Install dependencies
npm install

# Copy environment config (optional)
# Create a .env file with:
# API_URL=http://localhost:8000

# Start development server (includes /api proxy to backend)
npm run dev
```

Frontend is now running at http://localhost:5173 (Vite dev server)
Admin dashboard: http://localhost:5173/admin/login

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://nutritrack:nutritrack_pass@localhost:5432/nutritrack` |
| `JWT_SECRET` | Secret key for JWT signing (change in production!) | `change_me_...` |
| `ADMIN_CORS_ORIGIN` | Frontend origin allowed for CORS | `http://localhost:3000` |
| `LOG_LEVEL` | Uvicorn log level | `info` |

### Frontend (`fyp-project/.env`)

| Variable | Description | Default |
|---|---|---|
| `API_URL` | Backend base URL for SSR loader fetches | `http://localhost:8000` |

---

## Admin Dashboard

Navigate to `/admin/login` and sign in with the credentials created via `create_admin.py`.

The dashboard lets you manage:
- **FAQs** — categories and Q&A items
- **Plans** — subscription tiers and their features
- **Testimonials** — user quotes (toggle active/hidden)
- **Team** — team member profiles
- **Meals** — sample food database entries
- **Settings** — `apk_url` (Download button URL), `video_url` (demo video URL)

All changes are reflected on the public site immediately — no redeployment required.

---

## Running Tests

### Backend

```bash
cd backend
pip install -r requirements.txt   # if not already installed
pytest -v
```

Tests use an SQLite in-memory database — no PostgreSQL needed for tests.

### Frontend Type Check

```bash
cd fyp-project
npm run typecheck
```

---

## Production Deployment

The recommended production setup is Docker Compose with:
1. Change `JWT_SECRET` in the backend environment to a long random string
2. Set `secure=True` on the JWT cookie (requires HTTPS — use an nginx/Caddy reverse proxy)
3. Use a managed PostgreSQL instance (Supabase, Railway, Render, etc.) and update `DATABASE_URL`
4. Run `docker compose up -d` on your server

---

## File Structure

```
(repo root)
├── fyp-project/          Frontend — React Router v7 SSR
│   ├── app/
│   │   ├── routes/       Page routes (home, team, privacy, tos, admin/*)
│   │   ├── components/   UI components (cards, admin sidebar, etc.)
│   │   └── utils/api.ts  Typed fetch helpers + TypeScript types
│   ├── express-server.mjs  Production proxy server
│   └── Dockerfile
├── backend/              Backend — FastAPI + SQLModel
│   ├── app/
│   │   ├── models/       SQLModel database tables
│   │   ├── schemas/      Pydantic request/response schemas
│   │   └── routers/      API route handlers (public + admin)
│   ├── alembic/          Database migrations
│   ├── scripts/          create_admin.py, seed.py
│   ├── tests/            pytest test suite
│   └── Dockerfile
├── docker-compose.yml    3-service stack (db + backend + frontend)
├── SETUP.md              This file
└── NEXT_STEPS.md         Future improvement roadmap
```
