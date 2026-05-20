from fastapi import APIRouter, HTTPException, Response
from sqlmodel import select

from app.auth import create_token, verify_password
from app.database import db_dependency
from app.models.admin_user import admin_user
from app.schemas.auth import AdminRead, LoginRequest

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/login")
def login(body: LoginRequest, response: Response, session: db_dependency):
    user = session.exec(select(admin_user).where(admin_user.username == body.username)).first()
    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_token(user.id)
    response.set_cookie(
        key="admin_token",
        value=token,
        httponly=True,
        samesite="strict",
        secure=False,
        max_age=60 * 60 * 8,
        path="/",
    )
    return {"ok": True, "admin": AdminRead(id=user.id, username=user.username)}


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie("admin_token", path="/", samesite="strict")
    return {"ok": True}
