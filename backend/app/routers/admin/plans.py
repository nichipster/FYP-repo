from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException
from sqlmodel import select

from app.database import db_dependency
from app.dependencies import admin_dependency
from app.models.audit_log import admin_audit_log
from app.models.plan import plan_feature, subscription_plan
from app.schemas.plan import (
    PlanCreate,
    PlanFeatureCreate,
    PlanFeatureRead,
    PlanFeatureUpdate,
    PlanRead,
    PlanUpdate,
)

router = APIRouter(prefix="/api/admin", tags=["admin"])


def _log(session, admin_id, action, resource_type, resource_id=None):
    session.add(admin_audit_log(
        admin_id=admin_id,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        created_at=datetime.now(timezone.utc),
    ))


def _plan_read(plan: subscription_plan, features: list[plan_feature]) -> PlanRead:
    return PlanRead(
        id=plan.id,
        name=plan.name,
        price_display=plan.price_display,
        period=plan.period,
        highlight=plan.highlight,
        badge=plan.badge,
        sort_order=plan.sort_order,
        features=[PlanFeatureRead(id=f.id, label=f.label, included=f.included, sort_order=f.sort_order) for f in features],
    )


@router.get("/plans", response_model=list[PlanRead])
def list_plans(current_admin: admin_dependency, session: db_dependency):
    plans = session.exec(select(subscription_plan).order_by(subscription_plan.sort_order)).all()
    features = session.exec(select(plan_feature).order_by(plan_feature.sort_order)).all()
    feat_map: dict[int, list[plan_feature]] = {}
    for f in features:
        feat_map.setdefault(f.plan_id, []).append(f)
    return [_plan_read(p, feat_map.get(p.id, [])) for p in plans]


@router.post("/plans", response_model=PlanRead, status_code=201)
def create_plan(body: PlanCreate, current_admin: admin_dependency, session: db_dependency):
    plan = subscription_plan(**body.model_dump())
    session.add(plan)
    session.commit()
    session.refresh(plan)
    _log(session, current_admin.id, "create", "plan", plan.id)
    session.commit()
    return _plan_read(plan, [])


@router.put("/plans/{plan_id}", response_model=PlanRead)
def update_plan(plan_id: int, body: PlanUpdate, current_admin: admin_dependency, session: db_dependency):
    plan = session.get(subscription_plan, plan_id)
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    for k, v in body.model_dump(exclude_none=True).items():
        setattr(plan, k, v)
    session.commit()
    session.refresh(plan)
    _log(session, current_admin.id, "update", "plan", plan.id)
    session.commit()
    features = session.exec(select(plan_feature).where(plan_feature.plan_id == plan.id).order_by(plan_feature.sort_order)).all()
    return _plan_read(plan, features)


@router.delete("/plans/{plan_id}", status_code=204)
def delete_plan(plan_id: int, current_admin: admin_dependency, session: db_dependency):
    plan = session.get(subscription_plan, plan_id)
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    _log(session, current_admin.id, "delete", "plan", plan_id)
    session.delete(plan)
    session.commit()


# ── Features ─────────────────────────────────────────────────────────────────

@router.post("/plan-features", response_model=PlanFeatureRead, status_code=201)
def create_feature(body: PlanFeatureCreate, current_admin: admin_dependency, session: db_dependency):
    if not session.get(subscription_plan, body.plan_id):
        raise HTTPException(status_code=404, detail="Plan not found")
    feat = plan_feature(**body.model_dump())
    session.add(feat)
    session.commit()
    session.refresh(feat)
    _log(session, current_admin.id, "create", "plan_feature", feat.id)
    session.commit()
    return feat


@router.put("/plan-features/{feat_id}", response_model=PlanFeatureRead)
def update_feature(feat_id: int, body: PlanFeatureUpdate, current_admin: admin_dependency, session: db_dependency):
    feat = session.get(plan_feature, feat_id)
    if not feat:
        raise HTTPException(status_code=404, detail="Feature not found")
    for k, v in body.model_dump(exclude_none=True).items():
        setattr(feat, k, v)
    session.commit()
    session.refresh(feat)
    return feat


@router.delete("/plan-features/{feat_id}", status_code=204)
def delete_feature(feat_id: int, current_admin: admin_dependency, session: db_dependency):
    feat = session.get(plan_feature, feat_id)
    if not feat:
        raise HTTPException(status_code=404, detail="Feature not found")
    session.delete(feat)
    session.commit()
