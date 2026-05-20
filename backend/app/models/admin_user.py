from datetime import datetime, timezone
from typing import Optional

from sqlmodel import Field, SQLModel


class admin_user(SQLModel, table=True):
    __tablename__ = "admin_user"

    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(unique=True, index=True, max_length=64)
    hashed_password: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
