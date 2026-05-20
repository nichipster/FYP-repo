from datetime import datetime, timezone
from typing import Optional

from sqlmodel import Field, SQLModel


class admin_audit_log(SQLModel, table=True):
    __tablename__ = "admin_audit_log"

    id: Optional[int] = Field(default=None, primary_key=True)
    admin_id: int = Field(foreign_key="admin_user.id")
    action: str = Field(max_length=16)
    resource_type: str = Field(max_length=64)
    resource_id: Optional[int] = Field(default=None)
    details: Optional[str] = Field(default=None)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
