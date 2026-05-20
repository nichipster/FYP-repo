from typing import Optional

from sqlmodel import Field, SQLModel


class subscription_plan(SQLModel, table=True):
    __tablename__ = "subscription_plan"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(max_length=64)
    price_display: str = Field(max_length=32)
    period: str = Field(max_length=32)
    highlight: bool = Field(default=False)
    badge: Optional[str] = Field(default=None, max_length=64)
    sort_order: int = Field(default=0)


class plan_feature(SQLModel, table=True):
    __tablename__ = "plan_feature"

    id: Optional[int] = Field(default=None, primary_key=True)
    plan_id: int = Field(foreign_key="subscription_plan.id")
    label: str
    included: bool = Field(default=True)
    sort_order: int = Field(default=0)
