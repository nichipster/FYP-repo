from pydantic import BaseModel


class SampleMealRead(BaseModel):
    id: int
    name: str
    cuisine: str
    calories: int
    protein: int
    carbs: int
    fat: int
    emoji: str
    tag: str
    tag_color: str
    sort_order: int


class SampleMealCreate(BaseModel):
    name: str
    cuisine: str
    calories: int
    protein: int
    carbs: int
    fat: int
    emoji: str
    tag: str
    tag_color: str
    sort_order: int = 0


class SampleMealUpdate(BaseModel):
    name: str | None = None
    cuisine: str | None = None
    calories: int | None = None
    protein: int | None = None
    carbs: int | None = None
    fat: int | None = None
    emoji: str | None = None
    tag: str | None = None
    tag_color: str | None = None
    sort_order: int | None = None
