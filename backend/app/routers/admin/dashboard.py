from fastapi import APIRouter
from sqlmodel import func, select

from app.database import db_dependency
from app.dependencies import admin_dependency
from app.models.faq import faq_item
from app.models.plan import subscription_plan
from app.models.sample_meal import sample_meal
from app.models.site_setting import site_setting
from app.models.team_member import team_member
from app.models.testimonial import testimonial
from app.schemas.dashboard import DashboardStats

router = APIRouter(prefix="/api/admin", tags=["admin"])


def _count(session, model) -> int:
    return session.exec(select(func.count()).select_from(model)).one()


@router.get("/dashboard", response_model=DashboardStats)
def get_dashboard(current_admin: admin_dependency, session: db_dependency):
    return DashboardStats(
        faqs=_count(session, faq_item),
        plans=_count(session, subscription_plan),
        testimonials=_count(session, testimonial),
        team_members=_count(session, team_member),
        meals=_count(session, sample_meal),
        settings=_count(session, site_setting),
    )
