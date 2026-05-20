from typing import Optional

from sqlmodel import Field, SQLModel


class site_setting(SQLModel, table=True):
    __tablename__ = "site_setting"

    id: Optional[int] = Field(default=None, primary_key=True)
    key: str = Field(unique=True, index=True, max_length=128)
    value: str
    description: Optional[str] = Field(default=None)
