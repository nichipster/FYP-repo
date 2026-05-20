from pydantic import BaseModel


class SiteSettingRead(BaseModel):
    id: int
    key: str
    value: str
    description: str | None


class SiteSettingUpdate(BaseModel):
    value: str
    description: str | None = None


class SiteSettingCreate(BaseModel):
    key: str
    value: str
    description: str | None = None
