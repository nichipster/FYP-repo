from pydantic import BaseModel


class DashboardStats(BaseModel):
    faqs: int
    plans: int
    testimonials: int
    team_members: int
    meals: int
    settings: int
