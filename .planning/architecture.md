# System Architecture — NutriTrack Website + Admin Platform

## 1. Current State

The website is a **purely static React Router v7 application** with zero backend integration.
All content (FAQs, testimonials, meal data, plan features, team info) is hardcoded in TypeScript files.

```
FYP-repo/fyp-project/
├── app/
│   ├── routes/          # home, team, privacy, tos
│   ├── components/      # all UI components with hardcoded data
│   └── root.tsx         # Navbar + Outlet + Footer layout
├── Dockerfile           # multi-stage Node 20 build → react-router-serve
└── react-router.config.ts   # SSR: true
```

**Tech Stack (existing):**
- React 19 + React Router 7 (SSR enabled)
- TypeScript 5.9
- Tailwind CSS v4
- Vite 7
- @heroicons/react 2.x
- Node 20 (runtime)

## 2. Target Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    BROWSER (Public Users)                   │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTPS
┌──────────────────────▼──────────────────────────────────────┐
│          React Router v7 Website (SSR)                      │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Public Routes: /, /team, /privacy, /tos               │ │
│  │  Admin Routes: /admin/login, /admin/*, /admin/...      │ │
│  └───────────────────────┬────────────────────────────────┘ │
│                          │ fetch() / loader                  │
│  ┌───────────────────────▼────────────────────────────────┐ │
│  │     Website FastAPI Backend (NEW)                      │ │
│  │  - /api/auth/...       (admin JWT auth)                │ │
│  │  - /api/content/...    (CMS: FAQs, plans, testimonials)│ │
│  │  - /api/team/...       (team member management)        │ │
│  │  - /api/settings/...   (site-wide settings)            │ │
│  └───────────────────────┬────────────────────────────────┘ │
│                          │                                   │
│  ┌───────────────────────▼────────────────────────────────┐ │
│  │     Website PostgreSQL Database                        │ │
│  │  - admin_user, faq, testimonial, plan_feature          │ │
│  │  - team_member, site_setting                           │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘

                          (Optional Integration)
┌─────────────────────────────────────────────────────────────┐
│         Main NutriTrack FastAPI Backend                     │
│         (Mobile App Backend — existing, separate)           │
│         Deployed separately, own DB                         │
└─────────────────────────────────────────────────────────────┘
```

## 3. Architectural Decisions

### Decision 1: Dedicated Website Backend vs. Shared Backend
**Chosen: Dedicated FastAPI backend for website**

Rationale:
- The mobile backend is already deployed and stable (submitted FYP)
- Coupling the website to the mobile backend creates fragile inter-service dependencies
- Website content (FAQs, testimonials) is website-specific, not mobile app data
- Allows independent deployment and versioning
- Simpler to reason about (no CORS complexity with mobile backend)

### Decision 2: Admin Auth — Shared User Table vs. Standalone Admin Table
**Chosen: Standalone admin_user table in website DB**

Rationale:
- Mobile app's `user` table is in a separate database
- Admin access to website is a distinct concern from mobile app user accounts
- Simpler credential management (no cross-DB joins)
- Website admins ≠ mobile app admins (different scope)

### Decision 3: Content Storage — Database vs. Flat Files
**Chosen: PostgreSQL database**

Rationale:
- CRUD admin operations need structured storage
- Enables audit trails
- Already using PostgreSQL in the main project; team has expertise
- Alembic migration support for schema evolution

### Decision 4: Admin UI — Separate SPA vs. Route within React Router App
**Chosen: Admin routes within the existing React Router v7 app**

Rationale:
- Single deployment artifact (one Docker container)
- Shared navbar/layout customization
- No CORS between frontend and backend needed when using SSR loaders
- React Router's `loader` and `action` functions handle server-side auth checks cleanly

## 4. Component Interaction

```
Admin Login Flow:
Browser → POST /api/auth/login → FastAPI → bcrypt verify → JWT → cookie

Admin Dashboard:
React Router loader() → GET /api/content/faqs (with JWT) → FastAPI → PostgreSQL → data

Public Page (dynamic):
React Router loader() → GET /api/content/faqs (no auth) → FastAPI → PostgreSQL → rendered HTML

Admin CRUD:
React Router action() → POST /api/content/faqs → FastAPI → PostgreSQL → redirect
```

## 5. File Structure (Target)

```
fyp-project/
├── app/
│   ├── routes/
│   │   ├── home.tsx          (existing, updated to use DB content)
│   │   ├── team.tsx          (existing, updated to use DB content)
│   │   ├── privacy.tsx       (existing, static — no change)
│   │   ├── tos.tsx           (existing, static — no change)
│   │   ├── admin/
│   │   │   ├── login.tsx     (NEW — admin login form)
│   │   │   ├── dashboard.tsx (NEW — admin home)
│   │   │   ├── faqs.tsx      (NEW — FAQ CRUD)
│   │   │   ├── plans.tsx     (NEW — pricing plan editor)
│   │   │   ├── testimonials.tsx (NEW)
│   │   │   ├── team.tsx      (NEW — team member editor)
│   │   │   └── settings.tsx  (NEW — site settings)
│   ├── components/
│   │   ├── admin/
│   │   │   ├── AdminNavbar.tsx    (NEW)
│   │   │   ├── AdminLayout.tsx    (NEW)
│   │   │   └── ProtectedRoute.tsx (NEW)
│   │   └── ... (existing components)
│   └── utils/
│       └── api.ts            (NEW — typed fetch helpers for backend)
│
├── backend/                  (NEW — FastAPI backend)
│   ├── app/
│   │   ├── main.py
│   │   ├── database.py
│   │   ├── models.py
│   │   ├── dependencies.py
│   │   ├── routers/
│   │   │   ├── auth.py
│   │   │   ├── faqs.py
│   │   │   ├── plans.py
│   │   │   ├── testimonials.py
│   │   │   ├── team.py
│   │   │   └── settings.py
│   │   └── schemas/
│   │       ├── auth.py
│   │       ├── content.py
│   │       └── team.py
│   ├── alembic/
│   ├── requirements.txt
│   └── .env
│
├── docker-compose.yml        (NEW — orchestrates frontend + backend + db)
├── Dockerfile                (existing — frontend)
└── backend/Dockerfile        (NEW — backend)
```

## 6. Data Flow for Dynamic Public Pages

After admin edits FAQs, the public homepage will serve fresh content from the DB:

```
1. User visits /
2. React Router home.tsx loader() calls GET /api/content/faqs (no auth)
3. FastAPI returns FAQ rows as JSON
4. React Router renders page server-side with live FAQ data
5. HTML sent to browser
```

This replaces hardcoded arrays in `faqs.tsx`, `data.tsx`, `mealrec.tsx`, etc.

## 7. Constraints and Assumptions

- Admin access is internal only (no public registration)
- Max 2-3 admin users initially (seeded via script)
- FastAPI backend runs on port 8000, React Router on port 3000
- PostgreSQL shared or separate from mobile backend (separate recommended)
- Redis NOT required for website backend (no caching complexity needed)
