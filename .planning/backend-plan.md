# FastAPI Backend Plan — NutriTrack Website

## 1. Overview

A dedicated FastAPI backend serving the website's admin dashboard and
providing dynamic content APIs for public pages.

Patterns mirror the main NutriTrack mobile backend (same team, same conventions):
- SQLModel + PostgreSQL + Alembic
- JWT auth (python-jose + bcrypt)
- Pydantic schemas for request/response validation
- Router-per-resource structure

## 2. Directory Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app, routers, CORS, lifespan
│   ├── database.py          # Engine creation from env
│   ├── models.py            # SQLModel table definitions
│   ├── dependencies.py      # get_db, get_admin_user, admin_dependency
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── auth.py          # POST /api/auth/login, logout, me
│   │   ├── faqs.py          # CRUD /api/content/faqs
│   │   ├── plans.py         # CRUD /api/content/plans
│   │   ├── testimonials.py  # CRUD /api/content/testimonials
│   │   ├── team.py          # CRUD /api/team
│   │   ├── meals.py         # CRUD /api/content/meals (sample foods)
│   │   └── settings.py      # GET/PUT /api/settings
│   └── schemas/
│       ├── __init__.py
│       ├── auth.py          # LoginRequest, TokenResponse
│       ├── faq.py           # FaqCreate, FaqRead, FaqUpdate
│       ├── plan.py          # PlanRead, PlanUpdate, PlanFeatureRead
│       ├── testimonial.py   # TestimonialCreate, TestimonialRead
│       ├── team.py          # TeamMemberCreate, TeamMemberRead
│       ├── meal.py          # MealItemCreate, MealItemRead
│       └── settings.py      # SiteSettingRead, SiteSettingUpdate
├── alembic/
│   ├── env.py
│   ├── script.py.mako
│   └── versions/
│       └── 001_initial_schema.py
├── scripts/
│   └── seed_admin.py        # One-time admin account creation
├── requirements.txt
├── pytest.ini
├── .env                     # NOT committed
├── .env.example             # Committed template
└── Dockerfile
```

## 3. main.py

```python
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import auth, faqs, plans, testimonials, team, meals, settings
import os

@asynccontextmanager
async def lifespan(app: FastAPI):
    yield  # Alembic handles migrations, no create_all

app = FastAPI(title="NutriTrack Website API", version="1.0.0", lifespan=lifespan)

origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "healthy", "service": "NutriTrack Website API"}

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(faqs.router, prefix="/api/content/faqs", tags=["faqs"])
app.include_router(plans.router, prefix="/api/content/plans", tags=["plans"])
app.include_router(testimonials.router, prefix="/api/content/testimonials", tags=["testimonials"])
app.include_router(team.router, prefix="/api/team", tags=["team"])
app.include_router(meals.router, prefix="/api/content/meals", tags=["meals"])
app.include_router(settings.router, prefix="/api/settings", tags=["settings"])
```

## 4. requirements.txt

```
# Web Framework
fastapi==0.115.12
uvicorn[standard]==0.34.0

# ORM & Database
sqlmodel==0.0.22
sqlalchemy==2.0.40
psycopg2-binary==2.9.10
alembic==1.15.2

# Auth & Security
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
bcrypt==4.0.1

# Validation & Config
pydantic==2.11.3
pydantic-settings==2.9.1
python-dotenv==1.1.0
python-multipart==0.0.9

# Testing
pytest==8.3.5
pytest-asyncio==0.26.0
httpx==0.28.1

# Code Quality
black==25.1.0
```

## 5. .env.example

```
# Database
POSTGRESQL_DATABASE_URL=postgresql://user:password@localhost:5432/nutritrack_website

# JWT
SECRET_KEY=your-256-bit-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

# CORS
ALLOWED_ORIGINS=http://localhost:3000,https://your-production-domain.com

# App
ENV=development
```

## 6. Router Patterns

### Auth Router (`routers/auth.py`)

```python
from fastapi import APIRouter, HTTPException, Response, status
from ..dependencies import db_dependency, admin_dependency
from ..models import admin_user
from ..schemas.auth import LoginRequest
from passlib.context import CryptContext
from jose import jwt
import os

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

@router.post("/login")
def login(body: LoginRequest, response: Response, db: db_dependency):
    admin = db.exec(select(admin_user).where(admin_user.username == body.username)).first()
    if not admin or not pwd_context.verify(body.password, admin.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not admin.is_active:
        raise HTTPException(status_code=403, detail="Account inactive")
    
    token = jwt.encode(
        {"sub": admin.username, "id": admin.id},
        os.getenv("SECRET_KEY"),
        algorithm=os.getenv("ALGORITHM", "HS256"),
    )
    response.set_cookie(
        key="admin_access_token",
        value=token,
        httponly=True,
        secure=os.getenv("ENV") == "production",
        samesite="strict",
        max_age=3600,
    )
    return {"username": admin.username, "email": admin.email}

@router.post("/logout")
def logout(response: Response):
    response.delete_cookie("admin_access_token")
    return {"message": "Logged out"}

@router.get("/me")
def me(current_admin: admin_dependency):
    return current_admin
```

### FAQ Router (`routers/faqs.py`)

```python
router = APIRouter()

@router.get("/", response_model=list[FaqGroupRead])  # public
def get_faqs(db: db_dependency): ...

@router.post("/", response_model=FaqItemRead, status_code=201)  # admin only
def create_faq(body: FaqItemCreate, db: db_dependency, _: admin_dependency): ...

@router.put("/{faq_id}", response_model=FaqItemRead)  # admin only
def update_faq(faq_id: int, body: FaqItemUpdate, db: db_dependency, _: admin_dependency): ...

@router.delete("/{faq_id}", status_code=204)  # admin only
def delete_faq(faq_id: int, db: db_dependency, _: admin_dependency): ...

@router.patch("/reorder", status_code=200)  # admin only — update sort_order
def reorder_faqs(order: list[int], db: db_dependency, _: admin_dependency): ...
```

## 7. Uvicorn Launch

```bash
# Development
uvicorn app.main:app --reload --port 8000

# Production (inside Docker)
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 2
```

## 8. Testing Strategy

Follow main backend patterns:
- `conftest.py` — test DB setup with rollback per test
- `test_auth.py` — login, logout, me, invalid creds
- `test_faqs.py` — CRUD, auth guards
- `test_plans.py` — CRUD, auth guards
- `test_team.py` — CRUD, auth guards

Test isolation: Use SQLite in-memory for tests (or PostgreSQL test DB like main backend).

## 9. Alembic Setup

```
alembic init alembic
# Update alembic/env.py to use SQLModel metadata and .env DATABASE_URL
alembic revision --autogenerate -m "initial_website_schema"
alembic upgrade head
```

## 10. Development Workflow

1. `cd backend && python -m uvicorn app.main:app --reload` (port 8000)
2. `cd fyp-project && npm run dev` (port 5173)
3. Frontend dev proxy: configure Vite to proxy `/api` to `localhost:8000`

Vite proxy config (`vite.config.ts`):
```ts
server: {
  proxy: {
    "/api": {
      target: "http://localhost:8000",
      changeOrigin: true,
    },
  },
},
```
