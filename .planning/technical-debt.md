# Technical Debt — NutriTrack Website

## Existing Technical Debt (Pre-Admin Phase)

### 1. All Content is Hardcoded (HIGH PRIORITY — being addressed)
**Files:**
- `app/components/faq/faqs.tsx` — hardcoded FAQ data
- `app/components/testimonials/data.tsx` — hardcoded testimonials
- `app/components/mealrecommendations/mealrec.tsx` — hardcoded sample meals
- `app/components/goals-cuisines/goalsconsts.tsx` — hardcoded goal types
- `app/components/goals-cuisines/cuisinesconsts.tsx` — hardcoded cuisines
- `app/components/teamcards/teamData.ts` — hardcoded team data
- `app/components/plans/freemium.tsx`, `premium.tsx`, `premium_annual.tsx` — hardcoded plan features
- `app/components/homecards/card6.tsx` — hardcoded video URL (Cloudinary)
- `app/components/navbar.tsx` — hardcoded APK download URL

**Impact:** Content changes require code deployment. Non-technical admin cannot update content.
**Resolution:** Phase 3 replaces hardcoded data with API-fetched data.

### 2. Typos in CSS Class Names (LOW)
Multiple components have `transistion-all` (should be `transition-all`):
- `app/components/priv/pp.tsx`
- `app/components/priv/pcon1.tsx`, `pcon2.tsx`, `pcon3.tsx`
- `app/components/terms/tcon1.tsx`, `tcon2.tsx`, `tcon3.tsx`

These are misspelled Tailwind classes that silently do nothing.

**Resolution:** Quick find-replace during code touch. No functional impact.

### 3. Fixed-Width CSS (`w-[1100px]`) on Privacy/ToS Pages (MEDIUM)
Privacy and Terms pages use explicit pixel widths (`w-[1100px]`) which break on smaller screens.
No `max-w` + `w-full` pattern used.

**Impact:** Mobile responsiveness is broken on /privacy and /tos.
**Resolution:** Replace with `max-w-5xl w-full` responsive patterns. Low effort.

### 4. Empty `document.tsx` Route File (LOW)
`app/routes/document.tsx` exists as a 1-line empty file. Not registered in `routes.ts`.

**Resolution:** Delete the file.

### 5. NavLink `to="/download"` 404 (MEDIUM)
`app/components/plans/temp.tsx` links "Get Started" to `/download` which doesn't exist.
This was likely intended to link to the APK download or App Store.

**Resolution:** Change to `href` pointing to APK URL, or a modal. Add to settings.

### 6. No Error State in Components (LOW)
Components expect data but have no fallback UI if loader fails.

**Resolution:** Add error boundaries and loading skeletons when transitioning to dynamic data.

### 7. GitHub Actions Workflow Mismatch (LOW)
`.github/workflows/static.yml` deploys "static content" to GitHub Pages,
but the app is an SSR React Router app that cannot run as static files.

The workflow uploads the entire repo as a static artifact, which won't work for SSR.
The Dockerfile is the correct deployment mechanism.

**Resolution:** Either:
a) Remove the GitHub Actions workflow (not needed if using Docker), or
b) Update it to build and push the Docker image to a registry

### 8. No Loading States on Public Page Transitions (LOW)
React Router SSR prevents flash-of-no-content but client-side navigations have no loading indicator.

**Resolution:** Add `useNavigation()` spinner in root layout.

### 9. `app/routes/document.tsx` Referenced Nowhere (LOW)
Not in `routes.ts`. Dead file.

**Resolution:** Delete.

---

## Technical Debt Introduced by This Phase (Acceptable Trade-offs)

### 10. No Refresh Token for Admin Sessions (ACCEPTED)
Admin sessions expire after 60 minutes. Admin must re-login. Acceptable for internal use.
V2 scope: add refresh token with 7-day sliding window.

### 11. No Admin Account Self-Management (ACCEPTED)
Admins cannot change their own password via the UI. Must use seed script.
V2 scope: add `/admin/settings/account` profile page.

### 12. No Drag-to-Reorder UI (ACCEPTED)
`sort_order` field exists in DB but reorder UI not planned for v1.
Admins can manually set sort_order numbers.
V2 scope: drag-and-drop reorder using @dnd-kit or similar.

### 13. Privacy/ToS Content Not CMS-Managed (ACCEPTED)
Legal pages remain static (hardcoded). Adding them to CMS increases scope significantly.
V2 scope: Add markdown-based legal page editor.

---

## Priority Resolution Order

| Priority | Debt Item | When to Fix |
|----------|-----------|-------------|
| HIGH | Hardcoded content → DB | Phase 3 |
| MEDIUM | `/download` 404 | Phase 2 (fix in navbar/settings) |
| MEDIUM | Fixed pixel widths on priv/tos | After Phase 4 |
| LOW | CSS typos `transistion-all` | Opportunistically when touching these files |
| LOW | Empty document.tsx | Phase 1 cleanup |
| LOW | GitHub Actions static.yml | Phase 5 Docker setup |
| LOW | No loading states | Phase 6 polish |
