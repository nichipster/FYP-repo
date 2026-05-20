from collections import defaultdict

from fastapi import APIRouter
from sqlmodel import select

from app.database import db_dependency
from app.models.faq import faq_category, faq_item
from app.models.plan import plan_feature, subscription_plan
from app.models.sample_meal import sample_meal
from app.models.site_setting import site_setting
from app.models.team_member import team_member
from app.models.testimonial import testimonial
from app.schemas.faq import FaqGroupRead, FaqItemRead
from app.schemas.plan import PlanFeatureRead, PlanRead
from app.schemas.sample_meal import SampleMealRead
from app.schemas.team_member import TeamMemberRead
from app.schemas.testimonial import TestimonialRead

router = APIRouter(prefix="/api", tags=["public"])


@router.get("/faqs", response_model=list[FaqGroupRead])
def get_faqs(session: db_dependency):
    categories = session.exec(select(faq_category).order_by(faq_category.sort_order)).all()
    items = session.exec(select(faq_item).order_by(faq_item.sort_order)).all()

    items_by_cat: dict[int, list[faq_item]] = defaultdict(list)
    for item in items:
        items_by_cat[item.category_id].append(item)

    return [
        FaqGroupRead(
            category=cat.name,
            category_id=cat.id,
            items=[
                FaqItemRead(id=i.id, question=i.question, answer=i.answer, sort_order=i.sort_order)
                for i in items_by_cat[cat.id]
            ],
        )
        for cat in categories
    ]


@router.get("/plans", response_model=list[PlanRead])
def get_plans(session: db_dependency):
    plans = session.exec(select(subscription_plan).order_by(subscription_plan.sort_order)).all()
    features = session.exec(select(plan_feature).order_by(plan_feature.sort_order)).all()

    features_by_plan: dict[int, list[plan_feature]] = defaultdict(list)
    for f in features:
        features_by_plan[f.plan_id].append(f)

    return [
        PlanRead(
            id=p.id,
            name=p.name,
            price_display=p.price_display,
            period=p.period,
            highlight=p.highlight,
            badge=p.badge,
            sort_order=p.sort_order,
            features=[
                PlanFeatureRead(id=f.id, label=f.label, included=f.included, sort_order=f.sort_order)
                for f in features_by_plan[p.id]
            ],
        )
        for p in plans
    ]


@router.get("/testimonials", response_model=list[TestimonialRead])
def get_testimonials(session: db_dependency):
    rows = session.exec(
        select(testimonial).where(testimonial.active == True).order_by(testimonial.sort_order)  # noqa: E712
    ).all()
    return [TestimonialRead(**r.model_dump()) for r in rows]


@router.get("/team", response_model=list[TeamMemberRead])
def get_team(session: db_dependency):
    rows = session.exec(select(team_member).order_by(team_member.sort_order)).all()
    return [TeamMemberRead(**r.model_dump()) for r in rows]


@router.get("/meals", response_model=list[SampleMealRead])
def get_meals(session: db_dependency):
    rows = session.exec(select(sample_meal).order_by(sample_meal.sort_order)).all()
    return [SampleMealRead(**r.model_dump()) for r in rows]


@router.get("/settings")
def get_settings(session: db_dependency) -> dict[str, str]:
    rows = session.exec(select(site_setting)).all()
    return {r.key: r.value for r in rows}
