from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException
from sqlmodel import select

from app.database import db_dependency
from app.dependencies import admin_dependency
from app.models.audit_log import admin_audit_log
from app.models.team_member import team_member
from app.schemas.team_member import TeamMemberCreate, TeamMemberRead, TeamMemberUpdate

router = APIRouter(prefix="/api/admin", tags=["admin"])


def _log(session, admin_id, action, resource_id=None):
    session.add(admin_audit_log(
        admin_id=admin_id,
        action=action,
        resource_type="team_member",
        resource_id=resource_id,
        created_at=datetime.now(timezone.utc),
    ))


@router.get("/team", response_model=list[TeamMemberRead])
def list_team(current_admin: admin_dependency, session: db_dependency):
    return session.exec(select(team_member).order_by(team_member.sort_order)).all()


@router.post("/team", response_model=TeamMemberRead, status_code=201)
def create_member(body: TeamMemberCreate, current_admin: admin_dependency, session: db_dependency):
    row = team_member(**body.model_dump())
    session.add(row)
    session.commit()
    session.refresh(row)
    _log(session, current_admin.id, "create", row.id)
    session.commit()
    return row


@router.put("/team/{mid}", response_model=TeamMemberRead)
def update_member(mid: int, body: TeamMemberUpdate, current_admin: admin_dependency, session: db_dependency):
    row = session.get(team_member, mid)
    if not row:
        raise HTTPException(status_code=404, detail="Team member not found")
    for k, v in body.model_dump(exclude_none=True).items():
        setattr(row, k, v)
    session.commit()
    session.refresh(row)
    _log(session, current_admin.id, "update", row.id)
    session.commit()
    return row


@router.delete("/team/{mid}", status_code=204)
def delete_member(mid: int, current_admin: admin_dependency, session: db_dependency):
    row = session.get(team_member, mid)
    if not row:
        raise HTTPException(status_code=404, detail="Team member not found")
    _log(session, current_admin.id, "delete", mid)
    session.delete(row)
    session.commit()
