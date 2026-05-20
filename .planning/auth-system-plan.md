# Admin Authentication System Plan

## 1. Overview

Admin-only authentication for the NutriTrack website admin dashboard.
Follows the same JWT + bcrypt pattern as the main NutriTrack mobile backend,
adapted for a web session context using HttpOnly cookies.

## 2. Auth Strategy

### Why HttpOnly Cookies over Bearer Tokens

The existing mobile backend uses `Authorization: Bearer <token>` headers (OAuth2).
For a web admin dashboard, **HttpOnly cookies** are safer:
- XSS cannot steal the token (JavaScript has no access)
- Automatic inclusion in same-origin requests
- CSRF protection via SameSite=Strict

### JWT Configuration (mirrors main backend)
```
Algorithm: HS256
Access token TTL: 60 minutes
Refresh token TTL: 7 days (optional for v1)
Cookie: admin_access_token (HttpOnly, Secure, SameSite=Strict)
```

## 3. Admin User Model

```python
class admin_user(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(unique=True, index=True)
    email: str = Field(unique=True)
    hashed_password: str
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=sg_now)
    last_login: Optional[datetime] = None
```

Seeded via a one-time script with bcrypt-hashed credentials.
No public registration endpoint — admin accounts created by team only.

## 4. Auth Endpoints

```
POST /api/auth/login
  Body: { username, password }
  Response: Sets HttpOnly cookie + returns { username, email }
  Errors: 401 if invalid, 403 if inactive

POST /api/auth/logout
  Clears cookie
  Returns: 200

GET /api/auth/me
  Requires valid cookie
  Returns: { id, username, email }

POST /api/auth/refresh (optional v2)
  Uses refresh token cookie to issue new access token
```

## 5. FastAPI Dependency

```python
# dependencies.py
from fastapi import Cookie, HTTPException, status
from jose import jwt, JWTError

def get_admin_user(
    admin_access_token: Optional[str] = Cookie(default=None)
) -> dict:
    if not admin_access_token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(admin_access_token, SECRET_KEY, algorithms=[ALGORITHM])
        return {"id": payload["id"], "username": payload["sub"]}
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

admin_dependency = Annotated[dict, Depends(get_admin_user)]
```

## 6. React Router Frontend Auth Flow

### Login Route (`/admin/login`)

```tsx
// routes/admin/login.tsx
export async function action({ request }: ActionFunctionArgs) {
  const form = await request.formData()
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: form.get("username"),
      password: form.get("password"),
    }),
    credentials: "include",
  })
  if (!res.ok) return { error: "Invalid credentials" }
  return redirect("/admin/dashboard")
}
```

### Protected Route Guard

```tsx
// components/admin/ProtectedRoute.tsx
export async function requireAdmin(request: Request) {
  const res = await fetch("/api/auth/me", {
    headers: { Cookie: request.headers.get("Cookie") ?? "" },
  })
  if (!res.ok) throw redirect("/admin/login")
  return await res.json()
}

// In each admin route loader:
export async function loader({ request }: LoaderFunctionArgs) {
  const admin = await requireAdmin(request)
  // fetch page data...
}
```

## 7. Session Cookie Configuration

```python
# In login endpoint:
response.set_cookie(
    key="admin_access_token",
    value=token,
    httponly=True,
    secure=True,        # HTTPS only in production
    samesite="strict",
    max_age=3600,       # 60 minutes
    path="/",
)
```

In development (HTTP), set `secure=False`.

## 8. CORS Configuration

```python
# main.py
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://nutritrack.example.com"],
    allow_credentials=True,   # required for cookies
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**CRITICAL:** `allow_credentials=True` with `allow_origins=["*"]` is invalid. Explicit origins required.

## 9. CSRF Protection

With `SameSite=Strict` cookies, CSRF attacks are inherently blocked for cross-origin requests.
For form submissions from the same origin (React Router actions), no additional CSRF token needed.

Add CSRF token in v2 if mixed-origin scenarios arise.

## 10. Security Checklist

- [ ] Passwords hashed with bcrypt, min cost factor 12
- [ ] Account lockout after 5 failed attempts (v2)
- [ ] HttpOnly + Secure + SameSite=Strict cookies
- [ ] Sensitive endpoints require admin dependency
- [ ] No admin credentials in source code (env vars only)
- [ ] Admin user seeding script excluded from version control output
- [ ] Audit log for login/logout events
- [ ] Token expiry enforced server-side
- [ ] Logout clears cookie with same path/domain settings

## 11. Admin Seeding Script

```python
# backend/scripts/seed_admin.py
from passlib.context import CryptContext
from sqlmodel import Session

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def seed():
    username = input("Admin username: ")
    email = input("Admin email: ")
    password = input("Admin password: ")
    
    hashed = pwd_context.hash(password)
    admin = admin_user(username=username, email=email, hashed_password=hashed)
    with Session(engine) as db:
        db.add(admin)
        db.commit()
    print(f"Admin '{username}' created.")
```

## 12. Route Protection Map

| Route | Auth Required | Role |
|-------|--------------|------|
| `/admin/login` | No | - |
| `/admin/dashboard` | Yes | admin |
| `/admin/faqs` | Yes | admin |
| `/admin/plans` | Yes | admin |
| `/admin/testimonials` | Yes | admin |
| `/admin/team` | Yes | admin |
| `/admin/settings` | Yes | admin |
| `/api/content/*` (GET) | No | public |
| `/api/content/*` (POST/PUT/DELETE) | Yes | admin |
