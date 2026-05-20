from typing import Optional

from sqlmodel import Field, SQLModel


class faq_category(SQLModel, table=True):
    __tablename__ = "faq_category"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(max_length=128)
    sort_order: int = Field(default=0)


class faq_item(SQLModel, table=True):
    __tablename__ = "faq_item"

    id: Optional[int] = Field(default=None, primary_key=True)
    category_id: int = Field(foreign_key="faq_category.id")
    question: str
    answer: str
    sort_order: int = Field(default=0)
