# Admin Dashboard Plan — NutriTrack Website

## 1. Overview

The admin dashboard is a set of protected React Router v7 routes that allow
website administrators to manage dynamic content displayed on public pages.

Access: `/admin/*` routes — protected by session cookie auth.
Navigation: Separate `AdminNavbar` component (not the public Navbar).

## 2. Admin Route Map

```
/admin/login           — Login form (public)
/admin/dashboard       — Overview + quick stats
/admin/faqs            — FAQ category & item management
/admin/plans           — Subscription plan feature editor
/admin/testimonials    — Testimonial carousel management
/admin/team            — Team member management
/admin/meals           — Sample food database
/admin/settings        — Site-wide settings (URLs, text)
```

## 3. Admin Layout

```tsx
// routes/admin/_layout.tsx (React Router layout route)
export async function loader({ request }) {
  await requireAdmin(request)   // redirects to /admin/login if not authed
  return null
}

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-gray-100 flex">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  )
}
```

**Sidebar links:**
- Dashboard (grid icon)
- FAQs (question mark icon)
- Plans (credit card icon)
- Testimonials (star icon)
- Team (users icon)
- Sample Meals (utensils icon)
- Settings (cog icon)
- Logout (arrow-right-on-rectangle icon)

## 4. Login Page (`/admin/login`)

```
┌──────────────────────────────────────┐
│           NutriTrack Admin           │
│                                      │
│  Username  [________________]        │
│  Password  [________________]        │
│                                      │
│          [ Sign In ]                 │
│                                      │
│  ⚠ Invalid credentials (if error)   │
└──────────────────────────────────────┘
```

Implementation:
- React Router `action()` function handles form POST
- On success: redirect to `/admin/dashboard`
- On failure: return `{ error: "Invalid credentials" }` and display inline

## 5. Dashboard (`/admin/dashboard`)

Quick overview of content counts:
```
┌──────────────────────────────────────────────────────┐
│  Admin Dashboard           Welcome, Nicholas          │
├──────────┬──────────┬──────────┬─────────────────────┤
│ 3 FAQ    │ 3 Plans  │ 5 Test.  │  6 Team Members      │
│ Categories│          │          │                      │
├──────────┴──────────┴──────────┴─────────────────────┤
│  Recent Changes                                       │
│  [audit log last 10 entries]                          │
└──────────────────────────────────────────────────────┘
```

Loader fetches: counts from each content type + recent audit log.

## 6. FAQ Manager (`/admin/faqs`)

Two-panel layout:
- Left: Category list with add/delete controls
- Right: Items for selected category, with inline edit/delete

```
┌────────────────┬──────────────────────────────────────┐
│ Categories     │ Items in "General"                   │
│─────────────── │──────────────────────────────────────│
│ ● General    3 │ + Add Question                       │
│   Diet & Health│                                       │
│   Food Track   │ Q: What is NutriTrack?               │
│ + Add Category │    A: NutriTrack is...  [Edit][Del]  │
│                │                                       │
│                │ Q: Is NutriTrack free?               │
│                │    A: Yes, we offer...  [Edit][Del]  │
└────────────────┴──────────────────────────────────────┘
```

CRUD operations via React Router `action()` with form method POST/PUT/DELETE.

## 7. Plans Editor (`/admin/plans`)

Three columns (one per plan). Each shows plan metadata + feature list.

```
┌─────────────┬───────────────┬─────────────────┐
│ Free        │ Premium       │ Premium Annual  │
│ S$0/forever │ S$9.90/month  │ S$99.00/year    │
│─────────────│───────────────│─────────────────│
│ Features:   │ Features:     │ Features:       │
│ ✓ Basic log │ ✓ Everything  │ ✓ Everything    │
│ ✓ Barcode   │ ✓ AI Photo    │ ✓ Early access  │
│ ✗ AI Photo  │ [+ Add]       │ [+ Add]         │
│ [+ Add]     │               │                 │
│             │ [Edit Plan]   │ [Edit Plan]     │
│ [Edit Plan] │               │                 │
└─────────────┴───────────────┴─────────────────┘
```

Edit plan modal: update name, price, period, highlight status, badge text.
Feature rows: inline edit label, toggle included/excluded, delete.

## 8. Testimonials Manager (`/admin/testimonials`)

Card grid with add/edit/delete controls.

```
┌──────────────────────────────────────────────┐
│ Testimonials                  [+ Add New]    │
├────────────┬───────────────┬─────────────────┤
│ Sarah L.   │ Marcus T.     │ Priya K.        │
│ Lost 12kg  │ Fitness Enth. │ Busy Prof.      │
│ "..."      │ "..."         │ "..."           │
│ [Edit][Del]│ [Edit][Del]   │ [Edit][Del]     │
└────────────┴───────────────┴─────────────────┘
```

Add/Edit modal: name, role, testimonial text, avatar initials, visibility toggle.

## 9. Team Manager (`/admin/team`)

List view with reorder, edit, show/hide.

```
┌──────────────────────────────────────────────────────┐
│ Team Members                          [+ Add Member] │
├────┬───────────────────────┬──────────┬──────────────┤
│ ↕  │ Nicholas (LN)         │ Visible  │ [Edit][Del]  │
│    │ Team Leader            │          │              │
├────┼───────────────────────┼──────────┼──────────────┤
│ ↕  │ Jia Sheng (HJ)        │ Visible  │ [Edit][Del]  │
│    │ Frontend Developer     │          │              │
└────┴───────────────────────┴──────────┴──────────────┘
```

## 10. Sample Meals Manager (`/admin/meals`)

Table with cuisine filter, add/edit/delete.

```
┌──────────────────────────────────────────────────────┐
│ Sample Meals    Filter: [All ▼]     [+ Add Meal]     │
├────────────┬──────────┬────────┬───────┬────────┬────┤
│ Name       │ Cuisine  │ Cals   │ P/C/F │ Tag    │    │
├────────────┼──────────┼────────┼───────┼────────┼────┤
│ 🍚 Chicken │ Hawker   │ 450    │32/52/10│ Local  │ [E]│
│ 🌿 Nasi L  │ Malay    │ 510    │18/58/24│ Local  │ [E]│
└────────────┴──────────┴────────┴───────┴────────┴────┘
```

## 11. Settings (`/admin/settings`)

Key-value editor with description for each setting.

```
┌──────────────────────────────────────────────────────┐
│ Site Settings                                        │
├────────────────────┬─────────────────────────────────┤
│ APK Download URL   │ [https://expo.dev/..........] ✏ │
│ Contact Email      │ [privacy@nutritrack.com...   ] ✏ │
│ Hero Title         │ [Your Personal Nutrition Gui.] ✏ │
│ Hero Subtitle      │ [AI-powered meal planning... ] ✏ │
│ Demo Video URL     │ [https://res.cloudinary.com. ] ✏ │
└────────────────────┴─────────────────────────────────┘
```

Each row has inline edit (click pencil → text input → Save).

## 12. React Router Action Pattern

All mutations follow this pattern:

```tsx
// routes/admin/faqs.tsx
export async function action({ request }: ActionFunctionArgs) {
  const admin = await requireAdmin(request)
  const formData = await request.formData()
  const intent = formData.get("intent") // "create" | "update" | "delete"
  
  if (intent === "create") {
    await fetch("/api/content/faqs/items", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: request.headers.get("Cookie") ?? "",
      },
      body: JSON.stringify({
        category_id: formData.get("category_id"),
        question: formData.get("question"),
        answer: formData.get("answer"),
      }),
    })
  }
  
  return redirect("/admin/faqs")
}
```

This pattern uses standard HTML forms (works without JavaScript as fallback)
and React Router's progressive enhancement model.

## 13. UI Styling Approach

- Consistent with existing website (Tailwind CSS v4, Inter font, green accent)
- Admin sidebar: `bg-gray-800` (dark), content area: `bg-gray-100`
- Tables: `bg-white rounded-2xl shadow-sm`
- Buttons: primary `bg-green-500`, danger `bg-red-500 hover:bg-red-600`
- Forms: `border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500`
- No external component library needed — use Tailwind primitives

## 14. Error Handling

- Form validation errors: displayed inline next to fields
- API errors: toast-style alert at top of page
- Auth errors: redirect to `/admin/login` with `?redirect=` param
- 404 for unknown admin routes: redirect to `/admin/dashboard`

## 15. Audit Logging

Every admin mutation writes to `admin_audit_log`:
```python
# In each router after successful mutation:
log = admin_audit_log(
    admin_username=current_admin["username"],
    action="created_faq_item",
    resource_type="faq_item",
    resource_id=new_item.id,
    detail=f"Created FAQ: '{new_item.question[:50]}'",
    ip_address=request.client.host if request.client else None,
)
db.add(log)
db.commit()
```
