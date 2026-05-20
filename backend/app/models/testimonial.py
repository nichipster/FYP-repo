from typing import Optional

from sqlmodel import Field, SQLModel


class testimonial(SQLModel, table=True):
    __tablename__ = "testimonial"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(max_length=128)
    role: str = Field(max_length=128)
    text: str
    avatar: str = Field(max_length=8)
    sort_order: int = Field(default=0)
    active: bool = Field(default=True)
