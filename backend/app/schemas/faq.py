from pydantic import BaseModel


class FaqItemRead(BaseModel):
    id: int
    question: str
    answer: str
    sort_order: int


class FaqGroupRead(BaseModel):
    category: str
    category_id: int
    items: list[FaqItemRead]


class FaqCategoryCreate(BaseModel):
    name: str
    sort_order: int = 0


class FaqCategoryUpdate(BaseModel):
    name: str | None = None
    sort_order: int | None = None


class FaqCategoryRead(BaseModel):
    id: int
    name: str
    sort_order: int


class FaqItemCreate(BaseModel):
    category_id: int
    question: str
    answer: str
    sort_order: int = 0


class FaqItemUpdate(BaseModel):
    category_id: int | None = None
    question: str | None = None
    answer: str | None = None
    sort_order: int | None = None
