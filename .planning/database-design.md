# Database Design — NutriTrack Website Backend

## 1. Database

**Engine:** PostgreSQL (same as main NutriTrack backend)
**ORM:** SQLModel (SQLAlchemy + Pydantic)
**Migrations:** Alembic
**Database name:** `nutritrack_website` (separate from main `NutriTrack` DB)

## 2. Tables

### admin_user
Stores website admin credentials. No public registration.

```python
class admin_user(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(unique=True, index=True, max_length=50)
    email: str = Field(unique=True, max_length=255)
    hashed_password: str
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=sg_now, sa_column=Column(DateTime(timezone=True)))
    last_login: Optional[datetime] = Field(default=None, sa_column=Column(DateTime(timezone=True), nullable=True))
```

### faq_category
Groups FAQs into categories (e.g., "General", "Diet & Health", "Food & Tracking").

```python
class faq_category(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(unique=True, max_length=100)
    sort_order: int = Field(default=0)
    is_visible: bool = Field(default=True)
    created_at: datetime = Field(default_factory=sg_now, sa_column=Column(DateTime(timezone=True)))
    updated_at: datetime = Field(default_factory=sg_now, sa_column=Column(DateTime(timezone=True)))
    
    items: list["faq_item"] = Relationship(back_populates="category",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"})
```

### faq_item
Individual FAQ question/answer pairs.

```python
class faq_item(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    category_id: int = Field(sa_column=Column(Integer, ForeignKey("faq_category.id", ondelete="CASCADE")))
    question: str = Field(max_length=500)
    answer: str
    sort_order: int = Field(default=0)
    is_visible: bool = Field(default=True)
    created_at: datetime = Field(default_factory=sg_now, sa_column=Column(DateTime(timezone=True)))
    updated_at: datetime = Field(default_factory=sg_now, sa_column=Column(DateTime(timezone=True)))
    
    category: Optional["faq_category"] = Relationship(back_populates="items")
```

### subscription_plan
The three pricing plans (Free, Premium, Premium Annual).

```python
class subscription_plan(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(unique=True, max_length=50)          # "Free", "Premium", "Premium Annual"
    price: str = Field(max_length=20)                       # "S$0", "S$9.90", "S$99.00"
    period: str = Field(max_length=30)                      # "forever", "per month", "per year"
    is_highlighted: bool = Field(default=False)             # "Popular" badge
    badge_text: Optional[str] = Field(default=None)        # "Save 28%"
    sort_order: int = Field(default=0)
    is_visible: bool = Field(default=True)
    updated_at: datetime = Field(default_factory=sg_now, sa_column=Column(DateTime(timezone=True)))
    
    features: list["plan_feature"] = Relationship(back_populates="plan",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"})
```

### plan_feature
Feature line-items for each subscription plan.

```python
class plan_feature(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    plan_id: int = Field(sa_column=Column(Integer, ForeignKey("subscription_plan.id", ondelete="CASCADE")))
    label: str = Field(max_length=200)
    is_included: bool = Field(default=True)
    sort_order: int = Field(default=0)
    
    plan: Optional["subscription_plan"] = Relationship(back_populates="features")
```

### testimonial
User testimonials shown in the homepage carousel.

```python
class testimonial(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(max_length=100)
    role: str = Field(max_length=150)           # e.g., "Lost 12kg in 3 months"
    text: str = Field(max_length=1000)
    avatar_initials: str = Field(max_length=3)  # e.g., "SL"
    sort_order: int = Field(default=0)
    is_visible: bool = Field(default=True)
    created_at: datetime = Field(default_factory=sg_now, sa_column=Column(DateTime(timezone=True)))
    updated_at: datetime = Field(default_factory=sg_now, sa_column=Column(DateTime(timezone=True)))
```

### team_member
Team member information shown on /team page.

```python
class team_member(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    initials: str = Field(max_length=3)
    name: str = Field(max_length=100)
    role: str = Field(max_length=100)
    email: str = Field(max_length=255)
    description: str = Field(max_length=500)
    bg_color: str = Field(max_length=50)        # Tailwind class e.g. "bg-emerald-500"
    sort_order: int = Field(default=0)
    is_visible: bool = Field(default=True)
    created_at: datetime = Field(default_factory=sg_now, sa_column=Column(DateTime(timezone=True)))
    updated_at: datetime = Field(default_factory=sg_now, sa_column=Column(DateTime(timezone=True)))
```

### sample_meal
Sample food items shown in the "Foods in Our Database" section (card4).

```python
class sample_meal(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(max_length=100)
    cuisine: str = Field(max_length=50)         # "Hawker", "Malay", etc.
    calories: int = Field(ge=0)
    protein_g: int = Field(ge=0)
    carb_g: int = Field(ge=0)
    fat_g: int = Field(ge=0)
    emoji: str = Field(max_length=10)
    tag: str = Field(max_length=50)             # "Local Favourite", "High Protein"
    tag_color: str = Field(max_length=100)      # Tailwind class string
    sort_order: int = Field(default=0)
    is_visible: bool = Field(default=True)
    created_at: datetime = Field(default_factory=sg_now, sa_column=Column(DateTime(timezone=True)))
    updated_at: datetime = Field(default_factory=sg_now, sa_column=Column(DateTime(timezone=True)))
```

### site_setting
Key-value store for site-wide settings (download URL, contact email, etc.)

```python
class site_setting(SQLModel, table=True):
    __tablename__ = "site_setting"
    key: str = Field(primary_key=True, max_length=100)
    value: str
    description: Optional[str] = Field(default=None, max_length=255)
    updated_at: datetime = Field(default_factory=sg_now, sa_column=Column(DateTime(timezone=True)))
    updated_by: Optional[str] = Field(default=None, max_length=50)  # admin username
```

Default site settings to seed:
| Key | Default Value | Description |
|-----|--------------|-------------|
| `apk_download_url` | `https://expo.dev/artifacts/.../app.apk` | APK download link |
| `contact_email` | `privacy@nutritrack.com` | Contact email |
| `hero_title` | `Your Personal Nutrition Guide` | Homepage hero title |
| `hero_subtitle` | `AI-powered meal planning...` | Homepage hero subtitle |
| `video_url` | `https://res.cloudinary.com/...mp4` | App demo video URL |
| `cloudinary_video_url` | ... | Cloudinary video URL |

### admin_audit_log
Tracks admin actions on the website CMS.

```python
class admin_audit_log(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    admin_username: str = Field(index=True, max_length=50)
    action: str = Field(max_length=100)         # "created_faq", "updated_plan", etc.
    resource_type: str = Field(max_length=50)   # "faq", "plan", "team_member"
    resource_id: Optional[int] = None
    detail: Optional[str] = None
    ip_address: Optional[str] = Field(default=None, max_length=45)
    created_at: datetime = Field(default_factory=sg_now, sa_column=Column(DateTime(timezone=True), index=True))
```

## 3. ER Diagram (Simplified)

```
admin_user ──────────────────────────────► admin_audit_log
                                           (admin_username FK-free for immutability)

faq_category ──── (1:many) ──► faq_item

subscription_plan ──── (1:many) ──► plan_feature

testimonial  (standalone)

team_member  (standalone)

sample_meal  (standalone)

site_setting (standalone, key-value)
```

## 4. Migration Plan

### Migration 001: initial_website_schema
Creates all tables in one migration:
- admin_user
- faq_category
- faq_item
- subscription_plan
- plan_feature
- testimonial
- team_member
- sample_meal
- site_setting
- admin_audit_log

### Migration 002: seed_default_content (data migration)
Inserts:
- 3 faq_category rows + 9 faq_item rows (from existing hardcoded data)
- 3 subscription_plan rows + ~22 plan_feature rows
- 5 testimonial rows
- 6 team_member rows
- 4 sample_meal rows
- 6 site_setting rows

### Migration 003 (future): Add dietary_goal entries if needed

## 5. Index Strategy

| Table | Indexed Columns |
|-------|----------------|
| admin_user | username, email |
| faq_item | category_id, sort_order |
| subscription_plan | sort_order |
| testimonial | sort_order, is_visible |
| team_member | sort_order, is_visible |
| sample_meal | cuisine, sort_order, is_visible |
| admin_audit_log | admin_username, created_at |
| site_setting | key (PK) |

## 6. Notes

- `sg_now()` uses `Asia/Singapore` timezone (matching main backend convention)
- `is_visible` flag allows soft-hiding content without deletion
- `sort_order` enables admin drag-to-reorder in future without schema changes
- No soft-delete pattern for simplicity; hard deletes are fine for CMS content
