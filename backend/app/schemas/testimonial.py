from pydantic import BaseModel


class TestimonialRead(BaseModel):
    id: int
    name: str
    role: str
    text: str
    avatar: str
    sort_order: int
    active: bool


class TestimonialCreate(BaseModel):
    name: str
    role: str
    text: str
    avatar: str
    sort_order: int = 0
    active: bool = True


class TestimonialUpdate(BaseModel):
    name: str | None = None
    role: str | None = None
    text: str | None = None
    avatar: str | None = None
    sort_order: int | None = None
    active: bool | None = None
