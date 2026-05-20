from pydantic import BaseModel


class LoginRequest(BaseModel):
    username: str
    password: str


class AdminRead(BaseModel):
    id: int
    username: str
