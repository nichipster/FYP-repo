from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException
from sqlmodel import select

from app.database import db_dependency
from app.dependencies import admin_dependency
from app.models.audit_log import admin_audit_log
from app.models.site_setting import site_setting
from app.schemas.site_setting import SiteSettingCreate, SiteSettingRead, SiteSettingUpdate

router = APIRouter(prefix="/api/admin", tags=["admin"])


def _log(session, admin_id, action, resource_id=None):
    session.add(admin_audit_log(
        admin_id=admin_id,
        action=action,
        resource_type="site_setting",
        resource_id=resource_id,
        created_at=datetime.now(timezone.utc),
    ))


@router.get("/settings", response_model=list[SiteSettingRead])
def list_settings(current_admin: admin_dependency, session: db_dependency):
    return session.exec(select(site_setting)).all()


@router.post("/settings", response_model=SiteSettingRead, status_code=201)
def create_setting(body: SiteSettingCreate, current_admin: admin_dependency, session: db_dependency):
    existing = session.exec(select(site_setting).where(site_setting.key == body.key)).first()
    if existing:
        raise HTTPException(status_code=409, detail="Setting key already exists")
    row = site_setting(**body.model_dump())
    session.add(row)
    session.commit()
    session.refresh(row)
    _log(session, current_admin.id, "create", row.id)
    session.commit()
    return row


@router.put("/settings/{key}", response_model=SiteSettingRead)
def update_setting(key: str, body: SiteSettingUpdate, current_admin: admin_dependency, session: db_dependency):
    row = session.exec(select(site_setting).where(site_setting.key == key)).first()
    if not row:
        raise HTTPException(status_code=404, detail="Setting not found")
    row.value = body.value
    if body.description is not None:
        row.description = body.description
    session.commit()
    session.refresh(row)
    _log(session, current_admin.id, "update", row.id)
    session.commit()
    return row


@router.delete("/settings/{key}", status_code=204)
def delete_setting(key: str, current_admin: admin_dependency, session: db_dependency):
    row = session.exec(select(site_setting).where(site_setting.key == key)).first()
    if not row:
        raise HTTPException(status_code=404, detail="Setting not found")
    _log(session, current_admin.id, "delete", row.id)
    session.delete(row)
    session.commit()
