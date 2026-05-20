from pydantic import BaseModel


class PlanFeatureRead(BaseModel):
    id: int
    label: str
    included: bool
    sort_order: int


class PlanRead(BaseModel):
    id: int
    name: str
    price_display: str
    period: str
    highlight: bool
    badge: str | None
    sort_order: int
    features: list[PlanFeatureRead]


class PlanCreate(BaseModel):
    name: str
    price_display: str
    period: str
    highlight: bool = False
    badge: str | None = None
    sort_order: int = 0


class PlanUpdate(BaseModel):
    name: str | None = None
    price_display: str | None = None
    period: str | None = None
    highlight: bool | None = None
    badge: str | None = None
    sort_order: int | None = None


class PlanFeatureCreate(BaseModel):
    plan_id: int
    label: str
    included: bool = True
    sort_order: int = 0


class PlanFeatureUpdate(BaseModel):
    label: str | None = None
    included: bool | None = None
    sort_order: int | None = None
