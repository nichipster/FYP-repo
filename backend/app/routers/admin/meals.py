from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException
from sqlmodel import select

from app.database import db_dependency
from app.dependencies import admin_dependency
from app.models.audit_log import admin_audit_log
from app.models.sample_meal import sample_meal
from app.schemas.sample_meal import SampleMealCreate, SampleMealRead, SampleMealUpdate

router = APIRouter(prefix="/api/admin", tags=["admin"])


def _log(session, admin_id, action, resource_id=None):
    session.add(admin_audit_log(
        admin_id=admin_id,
        action=action,
        resource_type="sample_meal",
        resource_id=resource_id,
        created_at=datetime.now(timezone.utc),
    ))


@router.get("/meals", response_model=list[SampleMealRead])
def list_meals(current_admin: admin_dependency, session: db_dependency):
    return session.exec(select(sample_meal).order_by(sample_meal.sort_order)).all()


@router.post("/meals", response_model=SampleMealRead, status_code=201)
def create_meal(body: SampleMealCreate, current_admin: admin_dependency, session: db_dependency):
    row = sample_meal(**body.model_dump())
    session.add(row)
    session.commit()
    session.refresh(row)
    _log(session, current_admin.id, "create", row.id)
    session.commit()
    return row


@router.put("/meals/{mid}", response_model=SampleMealRead)
def update_meal(mid: int, body: SampleMealUpdate, current_admin: admin_dependency, session: db_dependency):
    row = session.get(sample_meal, mid)
    if not row:
        raise HTTPException(status_code=404, detail="Meal not found")
    for k, v in body.model_dump(exclude_none=True).items():
        setattr(row, k, v)
    session.commit()
    session.refresh(row)
    _log(session, current_admin.id, "update", row.id)
    session.commit()
    return row


@router.delete("/meals/{mid}", status_code=204)
def delete_meal(mid: int, current_admin: admin_dependency, session: db_dependency):
    row = session.get(sample_meal, mid)
    if not row:
        raise HTTPException(status_code=404, detail="Meal not found")
    _log(session, current_admin.id, "delete", mid)
    session.delete(row)
    session.commit()
