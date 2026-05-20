# Implementation Roadmap — NutriTrack Website Admin Platform

## Phase Overview

| Phase | Focus | Duration | Priority |
|-------|-------|----------|----------|
| Phase 1 | Backend Foundation | 2–3 days | CRITICAL |
| Phase 2 | Admin Auth + Login | 1–2 days | CRITICAL |
| Phase 3 | Dynamic Public Pages | 2–3 days | HIGH |
| Phase 4 | Admin Dashboard UI | 3–5 days | HIGH |
| Phase 5 | Docker + Deployment | 1–2 days | MEDIUM |
| Phase 6 | Testing + Polish | 2–3 days | MEDIUM |

---

## Phase 1: Backend Foundation

**Goal:** Working FastAPI backend with database, models, and seeded data.

### Tasks

1. **Create backend directory structure**
   ```
   mkdir backend/app backend/app/routers backend/app/schemas backend/alembic backend/scripts
   ```

2. **Create `backend/requirements.txt`** (from backend-plan.md)

3. **Create `backend/.env.example`** (from backend-plan.md)

4. **Create `backend/app/models.py`**
   - `admin_user`, `faq_category`, `faq_item`, `subscription_plan`, `plan_feature`
   - `testimonial`, `team_member`, `sample_meal`, `site_setting`, `admin_audit_log`
   - Import sg_now() timezone helper

5. **Create `backend/app/database.py`**
   - PostgreSQL connection from `POSTGRESQL_DATABASE_URL` env var
   - Mirrors main backend pattern

6. **Create `backend/app/dependencies.py`**
   - `get_db()` session dependency
   - `get_admin_user()` cookie-based JWT dependency
   - `admin_dependency` type alias

7. **Create `backend/app/main.py`**
   - FastAPI app with CORS middleware
   - Health endpoint
   - Router includes (all prefixed `/api`)

8. **Initialize Alembic**
   ```bash
   cd backend && alembic init alembic
   # Update env.py to import SQLModel metadata + load .env
   ```

9. **Generate + run initial migration**
   ```bash
   alembic revision --autogenerate -m "initial_website_schema"
   alembic upgrade head
   ```

10. **Create seeding script (`backend/scripts/seed_content.py`)**
    - Seeds: faq categories/items, plans/features, testimonials, team_members, sample_meals, site_settings
    - Data taken from existing hardcoded TypeScript files
    
11. **Create admin creation script (`backend/scripts/seed_admin.py`)**
    - Interactive CLI: prompts for username, email, password
    - Hashes with bcrypt and inserts `admin_user` row

**Deliverable:** `GET /health` returns 200, database has all tables + seeded data.

---

## Phase 2: Admin Authentication

**Goal:** Admin login/logout working end-to-end with cookie session.

### Tasks

1. **Create `backend/app/schemas/auth.py`**
   - `LoginRequest(BaseModel)`: username, password
   - `AdminResponse(BaseModel)`: username, email

2. **Create `backend/app/routers/auth.py`**
   - `POST /api/auth/login` — bcrypt verify, JWT cookie set
   - `POST /api/auth/logout` — cookie clear
   - `GET /api/auth/me` — validate cookie, return admin info

3. **Create `app/routes/admin/login.tsx`**
   - HTML form with username/password fields
   - React Router `action()` posts to `/api/auth/login`
   - Redirect to `/admin/dashboard` on success
   - Show error message on failure

4. **Create `app/components/admin/ProtectedRoute.tsx`**
   - `requireAdmin(request)` helper
   - Calls `GET /api/auth/me` with forwarded Cookie header
   - Throws `redirect("/admin/login")` on 401

5. **Create `app/routes/admin/_layout.tsx`**
   - Layout route with `requireAdmin` in loader
   - Renders `<AdminSidebar />` + `<Outlet />`

6. **Create `app/components/admin/AdminSidebar.tsx`**
   - Links to all admin routes
   - Logout form (POST to `/api/auth/logout`)

7. **Update `fyp-project/app/routes.ts`**
   - Add admin route tree:
   ```ts
   route("admin", "routes/admin/_layout.tsx", [
     index("routes/admin/dashboard.tsx"),
     route("login", "routes/admin/login.tsx"),
     route("faqs", "routes/admin/faqs.tsx"),
     route("plans", "routes/admin/plans.tsx"),
     route("testimonials", "routes/admin/testimonials.tsx"),
     route("team", "routes/admin/team.tsx"),
     route("meals", "routes/admin/meals.tsx"),
     route("settings", "routes/admin/settings.tsx"),
   ])
   ```

8. **Configure Vite proxy for development**
   - Add proxy config: `/api` → `http://localhost:8000`

**Deliverable:** Admin can login at `/admin/login`, is redirected to dashboard, cookie persists, logout works.

---

## Phase 3: Dynamic Public Pages

**Goal:** Existing public pages serve content from database instead of hardcoded files.

### Tasks

1. **Create all content routers in backend:**
   - `routers/faqs.py` — GET public endpoint
   - `routers/plans.py` — GET public endpoint
   - `routers/testimonials.py` — GET public endpoint
   - `routers/team.py` — GET public endpoint
   - `routers/meals.py` — GET public endpoint with cuisine filter
   - `routers/settings.py` — GET all settings

2. **Update `app/routes/home.tsx`**
   - Add `loader()` function fetching FAQs, testimonials, plans, meals, settings
   - Pass data to components via `useLoaderData()`

3. **Update `app/routes/team.tsx`**
   - Add `loader()` fetching team members from `/api/team`

4. **Update homepage components to accept props instead of hardcoded data:**
   - `card4.tsx` (RecommendedMealsSection) — accept `foods` + `filters` props
   - `card5.tsx` (Fifth/Plans) — accept `plans` prop
   - `card7.tsx` (Seventh/Testimonials) — accept `testimonials` prop
   - `card8.tsx` (Eighth/FAQs) — accept `faqs` prop
   - `card1.tsx` — accept `title` + `subtitle` props from settings
   - `card6.tsx` — accept `videoUrl` prop from settings
   - `navbar.tsx` — accept `downloadUrl` from settings (or keep hardcoded for now)
   - `teamcards/teamData.ts` — delete; data comes from DB

5. **Verify SSR rendering still works** with dynamic data

6. **Fallback strategy:** If backend is unavailable, components fall back to hardcoded defaults (prevents site outage if backend goes down)

**Deliverable:** Public pages render DB content. Changing a FAQ in DB reflects immediately on the live site.

---

## Phase 4: Admin Dashboard UI

**Goal:** Complete CRUD interface for all content types.

### Tasks (in priority order)

1. **Admin Dashboard page (`/admin/dashboard`)**
   - Fetch content counts from backend
   - Display count cards + recent audit log

2. **FAQ Manager (`/admin/faqs`)**
   - Category list + item list
   - Create/edit/delete categories
   - Create/edit/delete items per category
   - Toggle visibility

3. **Plans Editor (`/admin/plans`)**
   - Three-column plan display
   - Edit plan metadata (modal)
   - Add/edit/delete features
   - Toggle feature included/excluded

4. **Testimonials Manager (`/admin/testimonials`)**
   - Grid of testimonial cards
   - Add/edit/delete
   - Toggle visibility

5. **Team Manager (`/admin/team`)**
   - List with edit/delete/hide controls
   - Add new team member

6. **Sample Meals Manager (`/admin/meals`)**
   - Table with cuisine filter
   - Add/edit/delete meals

7. **Settings Editor (`/admin/settings`)**
   - Key-value list with inline edit
   - Particularly important: APK download URL, video URL

**Deliverable:** Admin can make changes to all content types and see them reflected on public pages.

---

## Phase 5: Docker + Deployment

**Goal:** Both frontend and backend deployable via Docker Compose.

### Tasks

1. **Create `backend/Dockerfile`**
   ```dockerfile
   FROM python:3.11-slim
   WORKDIR /app
   COPY requirements.txt .
   RUN pip install -r requirements.txt
   COPY . .
   CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
   ```

2. **Create `docker-compose.yml`** at repo root
   ```yaml
   services:
     frontend:
       build: ./fyp-project
       ports: ["3000:3000"]
       environment:
         - API_BASE_URL=http://backend:8000
     
     backend:
       build: ./backend
       ports: ["8000:8000"]
       env_file: ./backend/.env
       depends_on: [db]
     
     db:
       image: postgres:16-alpine
       environment:
         POSTGRES_DB: nutritrack_website
         POSTGRES_USER: nutritrack
         POSTGRES_PASSWORD: ${DB_PASSWORD}
       volumes:
         - pgdata:/var/lib/postgresql/data
   
   volumes:
     pgdata:
   ```

3. **Update frontend Dockerfile** to accept `API_BASE_URL` env var for SSR fetch calls

4. **Create `.env.docker.example`** for Docker deployment

5. **Update `README.md`** with Docker Compose quickstart

**Deliverable:** `docker compose up` starts the full stack.

---

## Phase 6: Testing + Polish

### Backend Tests
- `test_auth.py` — login, logout, me, invalid, inactive
- `test_faqs.py` — CRUD, auth guards, ordering
- `test_plans.py` — plan metadata + features CRUD
- `test_testimonials.py` — CRUD
- `test_team.py` — CRUD
- `test_settings.py` — get, update

### Frontend Polish
- Loading states for async content fetches
- Empty state handling (no FAQs, no testimonials yet)
- Form validation with helpful error messages
- Confirm dialog before deletes
- Success toast notifications after mutations

### Security Hardening
- Rate limit login endpoint (10 req/min per IP) using SlowAPI or middleware
- `X-Content-Type-Options: nosniff` header
- `X-Frame-Options: DENY` header
- Remove Swagger/ReDoc in production

---

## Development Order Justification

1. Backend first → enables all frontend features
2. Auth second → gates all admin operations
3. Public pages third → highest user-facing impact, unblocks team demos
4. Admin UI fourth → depends on all above
5. Docker fifth → deployment preparation
6. Tests last → code stable enough to test meaningfully

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| PostgreSQL connection fails in dev | Medium | High | Provide SQLite fallback for tests; clear .env.example |
| CORS issues between Vite dev server and FastAPI | Medium | Medium | Vite proxy in dev; explicit origins in prod |
| SSR fetch fails (backend down) | Low | High | Fallback to hardcoded data in loader |
| Cookie not sent in SSR context | Medium | High | Forward Cookie header explicitly in server-side fetch |
| React Router 7 SSR + dynamic data causes hydration mismatch | Low | Medium | Test with SSR disabled first, then enable |
| Admin accidentally deletes all FAQs | Low | Medium | Soft-delete or confirmation dialogs |
