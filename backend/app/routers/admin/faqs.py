from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException
from sqlmodel import select

from app.database import db_dependency
from app.dependencies import admin_dependency
from app.models.audit_log import admin_audit_log
from app.models.faq import faq_category, faq_item
from app.schemas.faq import (
    FaqCategoryCreate,
    FaqCategoryRead,
    FaqCategoryUpdate,
    FaqItemCreate,
    FaqItemRead,
    FaqItemUpdate,
)

router = APIRouter(prefix="/api/admin", tags=["admin"])


def _log(session, admin_id, action, resource_type, resource_id=None, details=None):
    session.add(admin_audit_log(
        admin_id=admin_id,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        details=details,
        created_at=datetime.now(timezone.utc),
    ))


# ── Categories ──────────────────────────────────────────────────────────────

@router.get("/faq-categories", response_model=list[FaqCategoryRead])
def list_categories(current_admin: admin_dependency, session: db_dependency):
    return session.exec(select(faq_category).order_by(faq_category.sort_order)).all()


@router.post("/faq-categories", response_model=FaqCategoryRead, status_code=201)
def create_category(body: FaqCategoryCreate, current_admin: admin_dependency, session: db_dependency):
    cat = faq_category(**body.model_dump())
    session.add(cat)
    session.commit()
    session.refresh(cat)
    _log(session, current_admin.id, "create", "faq_category", cat.id)
    session.commit()
    return cat


@router.put("/faq-categories/{cat_id}", response_model=FaqCategoryRead)
def update_category(cat_id: int, body: FaqCategoryUpdate, current_admin: admin_dependency, session: db_dependency):
    cat = session.get(faq_category, cat_id)
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    for k, v in body.model_dump(exclude_none=True).items():
        setattr(cat, k, v)
    session.commit()
    session.refresh(cat)
    _log(session, current_admin.id, "update", "faq_category", cat.id)
    session.commit()
    return cat


@router.delete("/faq-categories/{cat_id}", status_code=204)
def delete_category(cat_id: int, current_admin: admin_dependency, session: db_dependency):
    cat = session.get(faq_category, cat_id)
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    _log(session, current_admin.id, "delete", "faq_category", cat_id)
    session.delete(cat)
    session.commit()


# ── Items ────────────────────────────────────────────────────────────────────

@router.get("/faqs", response_model=list[FaqItemRead])
def list_items(current_admin: admin_dependency, session: db_dependency):
    return session.exec(select(faq_item).order_by(faq_item.sort_order)).all()


@router.post("/faqs", response_model=FaqItemRead, status_code=201)
def create_item(body: FaqItemCreate, current_admin: admin_dependency, session: db_dependency):
    if not session.get(faq_category, body.category_id):
        raise HTTPException(status_code=404, detail="Category not found")
    item = faq_item(**body.model_dump())
    session.add(item)
    session.commit()
    session.refresh(item)
    _log(session, current_admin.id, "create", "faq_item", item.id)
    session.commit()
    return item


@router.put("/faqs/{item_id}", response_model=FaqItemRead)
def update_item(item_id: int, body: FaqItemUpdate, current_admin: admin_dependency, session: db_dependency):
    item = session.get(faq_item, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="FAQ item not found")
    for k, v in body.model_dump(exclude_none=True).items():
        setattr(item, k, v)
    session.commit()
    session.refresh(item)
    _log(session, current_admin.id, "update", "faq_item", item.id)
    session.commit()
    return item


@router.delete("/faqs/{item_id}", status_code=204)
def delete_item(item_id: int, current_admin: admin_dependency, session: db_dependency):
    item = session.get(faq_item, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="FAQ item not found")
    _log(session, current_admin.id, "delete", "faq_item", item_id)
    session.delete(item)
    session.commit()
