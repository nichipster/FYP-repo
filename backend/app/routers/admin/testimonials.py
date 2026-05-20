from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException
from sqlmodel import select

from app.database import db_dependency
from app.dependencies import admin_dependency
from app.models.audit_log import admin_audit_log
from app.models.testimonial import testimonial
from app.schemas.testimonial import TestimonialCreate, TestimonialRead, TestimonialUpdate

router = APIRouter(prefix="/api/admin", tags=["admin"])


def _log(session, admin_id, action, resource_id=None):
    session.add(admin_audit_log(
        admin_id=admin_id,
        action=action,
        resource_type="testimonial",
        resource_id=resource_id,
        created_at=datetime.now(timezone.utc),
    ))


@router.get("/testimonials", response_model=list[TestimonialRead])
def list_testimonials(current_admin: admin_dependency, session: db_dependency):
    return session.exec(select(testimonial).order_by(testimonial.sort_order)).all()


@router.post("/testimonials", response_model=TestimonialRead, status_code=201)
def create_testimonial(body: TestimonialCreate, current_admin: admin_dependency, session: db_dependency):
    row = testimonial(**body.model_dump())
    session.add(row)
    session.commit()
    session.refresh(row)
    _log(session, current_admin.id, "create", row.id)
    session.commit()
    return row


@router.put("/testimonials/{tid}", response_model=TestimonialRead)
def update_testimonial(tid: int, body: TestimonialUpdate, current_admin: admin_dependency, session: db_dependency):
    row = session.get(testimonial, tid)
    if not row:
        raise HTTPException(status_code=404, detail="Testimonial not found")
    for k, v in body.model_dump(exclude_none=True).items():
        setattr(row, k, v)
    session.commit()
    session.refresh(row)
    _log(session, current_admin.id, "update", row.id)
    session.commit()
    return row


@router.delete("/testimonials/{tid}", status_code=204)
def delete_testimonial(tid: int, current_admin: admin_dependency, session: db_dependency):
    row = session.get(testimonial, tid)
    if not row:
        raise HTTPException(status_code=404, detail="Testimonial not found")
    _log(session, current_admin.id, "delete", tid)
    session.delete(row)
    session.commit()
