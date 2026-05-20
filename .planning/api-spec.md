# API Specification — NutriTrack Website Backend

Base URL: `/api`
Auth: HttpOnly cookie `admin_access_token` (required for write endpoints)

## Auth Endpoints

### POST /api/auth/login
Login as admin.
- **Body:** `{ "username": string, "password": string }`
- **Response 200:** `{ "username": string, "email": string }`
- **Sets Cookie:** `admin_access_token` (HttpOnly, Secure, SameSite=Strict, 60min)
- **Errors:** 401 invalid creds, 403 inactive account

### POST /api/auth/logout
Clear admin session.
- **No body required**
- **Response 200:** `{ "message": "Logged out" }`
- **Clears Cookie:** `admin_access_token`

### GET /api/auth/me
Get current admin info (validates cookie).
- **Response 200:** `{ "id": int, "username": string }`
- **Error 401:** Not authenticated

---

## FAQ Endpoints

### GET /api/content/faqs
Public. Returns all visible FAQ categories with their items.
- **Response 200:**
```json
[
  {
    "id": 1,
    "name": "General",
    "sort_order": 0,
    "items": [
      { "id": 1, "question": "...", "answer": "...", "sort_order": 0 }
    ]
  }
]
```

### GET /api/content/faqs/admin
Admin only. Returns all FAQs including hidden ones.
- **Response 200:** Same structure as above, includes `is_visible` fields.

### POST /api/content/faqs/categories
Admin only. Create FAQ category.
- **Body:** `{ "name": string, "sort_order": int, "is_visible": bool }`
- **Response 201:** Created category object

### PUT /api/content/faqs/categories/{id}
Admin only. Update FAQ category.
- **Body:** `{ "name"?: string, "sort_order"?: int, "is_visible"?: bool }`
- **Response 200:** Updated category object

### DELETE /api/content/faqs/categories/{id}
Admin only. Delete category (cascades to items).
- **Response 204:** No content

### POST /api/content/faqs/items
Admin only. Create FAQ item.
- **Body:** `{ "category_id": int, "question": string, "answer": string, "sort_order": int }`
- **Response 201:** Created item object

### PUT /api/content/faqs/items/{id}
Admin only. Update FAQ item.
- **Body:** `{ "question"?: string, "answer"?: string, "sort_order"?: int, "is_visible"?: bool }`
- **Response 200:** Updated item object

### DELETE /api/content/faqs/items/{id}
Admin only. Delete FAQ item.
- **Response 204:** No content

### PATCH /api/content/faqs/reorder
Admin only. Bulk update sort_order for items.
- **Body:** `[{ "id": int, "sort_order": int }]`
- **Response 200:** `{ "updated": int }`

---

## Subscription Plan Endpoints

### GET /api/content/plans
Public. Returns visible plans with features.
- **Response 200:**
```json
[
  {
    "id": 1,
    "name": "Free",
    "price": "S$0",
    "period": "forever",
    "is_highlighted": false,
    "badge_text": null,
    "sort_order": 0,
    "features": [
      { "id": 1, "label": "Basic meal logging", "is_included": true, "sort_order": 0 }
    ]
  }
]
```

### GET /api/content/plans/admin
Admin only. Returns all plans including hidden.

### PUT /api/content/plans/{id}
Admin only. Update plan metadata.
- **Body:** `{ "name"?: string, "price"?: string, "period"?: string, "is_highlighted"?: bool, "badge_text"?: string }`
- **Response 200:** Updated plan

### POST /api/content/plans/{plan_id}/features
Admin only. Add feature to plan.
- **Body:** `{ "label": string, "is_included": bool, "sort_order": int }`
- **Response 201:** Created feature

### PUT /api/content/plans/features/{feature_id}
Admin only. Update plan feature.
- **Body:** `{ "label"?: string, "is_included"?: bool, "sort_order"?: int }`
- **Response 200:** Updated feature

### DELETE /api/content/plans/features/{feature_id}
Admin only. Remove feature from plan.
- **Response 204:** No content

---

## Testimonial Endpoints

### GET /api/content/testimonials
Public. Returns visible testimonials ordered by sort_order.
- **Response 200:**
```json
[
  {
    "id": 1,
    "name": "Sarah L.",
    "role": "Lost 12kg in 3 months",
    "text": "NutriTrack completely changed...",
    "avatar_initials": "SL",
    "sort_order": 0
  }
]
```

### GET /api/content/testimonials/admin
Admin only. Includes hidden testimonials.

### POST /api/content/testimonials
Admin only. Create testimonial.
- **Body:** `{ "name": string, "role": string, "text": string, "avatar_initials": string, "sort_order": int }`
- **Response 201:** Created testimonial

### PUT /api/content/testimonials/{id}
Admin only. Update testimonial.
- **Body:** Partial testimonial fields
- **Response 200:** Updated testimonial

### DELETE /api/content/testimonials/{id}
Admin only.
- **Response 204:** No content

---

## Team Member Endpoints

### GET /api/team
Public. Returns visible team members ordered by sort_order.
- **Response 200:**
```json
[
  {
    "id": 1,
    "initials": "LN",
    "name": "Let Yan Dong Nicholas",
    "role": "TEAM LEADER / BACKEND DEVELOPER",
    "email": "nydlet001@mymail.sim.edu.sg",
    "description": "...",
    "bg_color": "bg-emerald-500",
    "sort_order": 0
  }
]
```

### GET /api/team/admin
Admin only. Includes hidden members.

### POST /api/team
Admin only. Create team member.
- **Body:** Full team member fields
- **Response 201:** Created member

### PUT /api/team/{id}
Admin only. Update team member.
- **Response 200:** Updated member

### DELETE /api/team/{id}
Admin only.
- **Response 204:** No content

---

## Sample Meal Endpoints

### GET /api/content/meals
Public. Returns visible sample meals. Optional `?cuisine=Hawker` filter.
- **Response 200:**
```json
{
  "meals": [...],
  "filters": ["All", "Hawker", "Malay", "Indian", "Japanese"]
}
```

### POST /api/content/meals
Admin only. Add sample meal.
- **Response 201:** Created meal

### PUT /api/content/meals/{id}
Admin only.
- **Response 200:** Updated meal

### DELETE /api/content/meals/{id}
Admin only.
- **Response 204:** No content

---

## Site Settings Endpoints

### GET /api/settings
Public. Returns all settings as key-value object.
- **Response 200:**
```json
{
  "apk_download_url": "https://...",
  "contact_email": "privacy@nutritrack.com",
  "hero_title": "Your Personal Nutrition Guide",
  "video_url": "https://..."
}
```

### GET /api/settings/{key}
Public. Single setting.
- **Response 200:** `{ "key": string, "value": string }`
- **Error 404:** Key not found

### PUT /api/settings/{key}
Admin only. Update setting.
- **Body:** `{ "value": string }`
- **Response 200:** `{ "key": string, "value": string, "updated_at": datetime }`

### POST /api/settings
Admin only. Create new setting.
- **Body:** `{ "key": string, "value": string, "description"?: string }`
- **Response 201:** Created setting

---

## Error Response Format

All errors follow:
```json
{
  "detail": "Human readable error message"
}
```

Standard HTTP status codes:
- 200 OK
- 201 Created
- 204 No Content
- 400 Bad Request (validation error)
- 401 Unauthorized (not logged in)
- 403 Forbidden (not admin)
- 404 Not Found
- 422 Unprocessable Entity (Pydantic validation)
- 500 Internal Server Error

---

## OpenAPI Documentation

FastAPI auto-generates docs at:
- `/docs` — Swagger UI
- `/redoc` — ReDoc
- `/openapi.json` — JSON schema

In production, consider disabling `/docs` and `/redoc`:
```python
app = FastAPI(docs_url=None, redoc_url=None)  # production
```
