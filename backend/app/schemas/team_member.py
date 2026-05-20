from pydantic import BaseModel


class TeamMemberRead(BaseModel):
    id: int
    initials: str
    name: str
    role: str
    email: str
    description: str
    bg_color: str
    sort_order: int


class TeamMemberCreate(BaseModel):
    initials: str
    name: str
    role: str
    email: str
    description: str
    bg_color: str
    sort_order: int = 0


class TeamMemberUpdate(BaseModel):
    initials: str | None = None
    name: str | None = None
    role: str | None = None
    email: str | None = None
    description: str | None = None
    bg_color: str | None = None
    sort_order: int | None = None
