# Security Considerations — NutriTrack Website Admin Platform

## 1. Authentication Security

### Password Storage
- bcrypt with cost factor ≥12 (passlib[bcrypt])
- Never store plaintext passwords anywhere
- Password minimum: 12 characters, 1 uppercase, 1 number (enforced in seed script)

### JWT / Session
- Algorithm: HS256 with 256-bit secret key (generated via `openssl rand -hex 32`)
- Access token TTL: 60 minutes (short-lived)
- Token stored in HttpOnly cookie (XSS cannot steal)
- `SameSite=Strict` prevents CSRF on cross-origin form submissions
- `Secure=True` in production (HTTPS required)
- Token revocation: on logout, cookie is cleared client-side; for true revocation, add token blacklist (v2)

### Brute Force Protection
- Rate limit `/api/auth/login`: 5 attempts per IP per 15 minutes
- Return generic "Invalid credentials" for both wrong username and wrong password (prevent username enumeration)
- Log failed login attempts to `admin_audit_log`

## 2. Authorization

### Route-Level Guards
- Every admin route loader calls `requireAdmin(request)` which validates cookie
- Every admin API endpoint uses `admin_dependency` (FastAPI dependency injection)
- Public GET endpoints require no auth (FAQs, plans, testimonials are public data)
- All mutating endpoints (POST/PUT/DELETE) require `admin_dependency`

### No Privilege Escalation
- Only one role: admin. No user-level access to admin routes.
- Admin accounts created only via CLI seed script — no self-registration API exists.

## 3. Input Validation

### Backend
- All request bodies validated via Pydantic schemas
- String length limits enforced on all model fields
- HTML injection: escape content on render (React does this by default with JSX)
- SQL injection: SQLModel/SQLAlchemy parameterized queries prevent this

### Frontend
- No `dangerouslySetInnerHTML` — all admin-entered content rendered via React JSX
- Form inputs validated client-side AND server-side (never trust client-only validation)
- `maxLength` attributes on all text inputs matching DB schema limits

## 4. CORS

```python
# Explicit origins — never use allow_origins=["*"] with credentials=True
allow_origins=["http://localhost:3000", "https://your-domain.com"]
allow_credentials=True
```

## 5. Security Headers

Add via FastAPI middleware or reverse proxy (nginx):
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy: default-src 'self'; ...
```

FastAPI middleware example:
```python
from fastapi import Request
from fastapi.responses import Response

@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    return response
```

## 6. Environment Variables / Secrets

**Never commit to git:**
- `.env` files
- `SECRET_KEY` values
- Database passwords
- Any API keys

**Always commit:**
- `.env.example` (template with placeholder values)
- `.gitignore` entries for `.env`

**Secret rotation:**
- `SECRET_KEY` change invalidates all existing sessions (acceptable trade-off)
- Document rotation procedure in README

## 7. Database Security

- Database credentials in environment variables only
- PostgreSQL user should have `SELECT, INSERT, UPDATE, DELETE` only (not `CREATE`, `DROP`)
- Use a separate PostgreSQL user for the website backend (not the main backend's user)
- Connection pool: `pool_pre_ping=True` to detect stale connections
- No raw SQL; all queries via SQLModel ORM

## 8. Logging and Audit Trail

All admin mutations logged to `admin_audit_log`:
- `admin_username` (who)
- `action` (what)
- `resource_type`, `resource_id` (what was changed)
- `ip_address` (from where)
- `created_at` (when)

Never log passwords, tokens, or sensitive data.

## 9. Production Hardening

- Disable FastAPI's OpenAPI docs (`/docs`, `/redoc`) in production:
  ```python
  app = FastAPI(docs_url=None if ENV == "production" else "/docs")
  ```
- Use HTTPS exclusively (enforce via load balancer or nginx)
- Set `secure=True` on all cookies
- Run uvicorn behind nginx (do not expose uvicorn directly)
- Regular dependency updates (`pip list --outdated`)

## 10. Threat Model

| Threat | Likelihood | Mitigation |
|--------|-----------|------------|
| XSS stealing admin session | Low (HttpOnly cookie) | HttpOnly cookie; no `dangerouslySetInnerHTML` |
| CSRF forcing admin mutations | Low (SameSite=Strict) | SameSite=Strict cookie attribute |
| Brute force login | Medium | Rate limiting; bcrypt slow hashing |
| SQL injection | Low | SQLModel parameterized queries |
| Unauthorized admin API access | Low | JWT dependency on all mutation endpoints |
| Sensitive data in logs | Medium | Audit log schema excludes sensitive fields |
| Secrets in source code | Low | .gitignore + .env.example pattern |
| Admin account compromise | Low | Strong password requirements; audit logging |
| Cookie theft via network | Low (production) | Secure=True; HTTPS only in production |

## 11. Compliance Notes

- Testimonials shown publicly — ensure they are genuine or clearly fictional
- Privacy Policy and Terms of Service are static pages — updating them requires a deployment (not CMS-managed yet; add to v2 scope if needed)
- No PII collected from website visitors (no forms, no tracking except Cloudinary video analytics)
- PDPA: admin credentials are internal only; website content is non-personal data
