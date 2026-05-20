from typing import Optional

from sqlmodel import Field, SQLModel


class sample_meal(SQLModel, table=True):
    __tablename__ = "sample_meal"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(max_length=128)
    cuisine: str = Field(max_length=64)
    calories: int
    protein: int
    carbs: int
    fat: int
    emoji: str = Field(max_length=8)
    tag: str = Field(max_length=64)
    tag_color: str = Field(max_length=128)
    sort_order: int = Field(default=0)
