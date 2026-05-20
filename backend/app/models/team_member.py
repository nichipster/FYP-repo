from typing import Optional

from sqlmodel import Field, SQLModel


class team_member(SQLModel, table=True):
    __tablename__ = "team_member"

    id: Optional[int] = Field(default=None, primary_key=True)
    initials: str = Field(max_length=4)
    name: str = Field(max_length=128)
    role: str = Field(max_length=128)
    email: str = Field(max_length=256)
    description: str
    bg_color: str = Field(max_length=64)
    sort_order: int = Field(default=0)
