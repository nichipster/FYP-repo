# NutriTrack Website — Next Steps

This document outlines recommended improvements for the website after the FYP presentation.

## Security (High Priority Before Public Launch)

- [ ] **Enable HTTPS** — Set up nginx/Caddy as a reverse proxy with Let's Encrypt TLS
- [ ] **Set `secure=True` on JWT cookie** — Requires HTTPS. Edit `backend/app/routers/auth.py` line with `set_cookie(..., secure=True)`
- [ ] **Rate limit login endpoint** — Add `slowapi` to limit `/api/auth/login` to ~5 attempts/minute to prevent brute force
- [ ] **Change JWT_SECRET** — Use a 64-character random string in production (e.g., `python -c "import secrets; print(secrets.token_hex(32))"`)

## Infrastructure

- [ ] **Managed PostgreSQL** — Move from self-hosted Docker DB to Supabase, Railway, or Render for easier backups/scaling
- [ ] **CI/CD pipeline** — GitHub Actions workflow that builds Docker images and pushes to a container registry on merge to main
- [ ] **Health check endpoint** — `/api/health` already exists; wire it up to Docker Compose `healthcheck` for the backend service

## Features

- [ ] **Image upload for team members** — Replace the initials-avatar with actual profile photos. Use Cloudinary or S3 for storage
- [ ] **Rich text for FAQ answers** — Switch FAQ answer field from plain text to Markdown (add a Markdown editor in the admin and a renderer in the public FAQ component)
- [ ] **Admin password change** — Add a `/admin/settings/password` page so admins can update their own password without running scripts
- [ ] **Multi-admin support** — The `admin_user` table supports multiple admins. Add an admin management page to create/delete admin accounts from the UI
- [ ] **Audit log viewer** — The `admin_audit_log` table already records all mutations. Add a read-only log page in the admin dashboard

## Public Website

- [ ] **Loading skeletons** — Add skeleton loaders to public pages while SSR data fetches resolve (unlikely in production SSR but improves perceived performance)
- [ ] **SEO improvements** — Add Open Graph tags, Twitter card meta, and a sitemap.xml
- [ ] **Analytics** — Integrate Plausible or Umami (privacy-friendly alternatives to Google Analytics) for visitor tracking

## Development Experience

- [ ] **End-to-end tests** — Add Playwright tests covering the happy path: load home → navigate to admin → login → create a FAQ → verify it appears on the homepage
- [ ] **Pre-commit hooks** — Add `ruff` for Python linting and `eslint` for TypeScript linting with a pre-commit hook
- [ ] **Docker development volumes** — The current `docker-compose.yml` mounts `./backend:/app` for hot reload. Add a similar mount for the frontend for a better dev experience
