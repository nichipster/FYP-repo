from typing import Annotated

from fastapi import Depends, HTTPException, Request
from jose import JWTError
from sqlmodel import Session

from app.auth import decode_token
from app.database import get_session
from app.models.admin_user import admin_user


def get_current_admin(request: Request, session: Session = Depends(get_session)) -> admin_user:
    token = request.cookies.get("admin_token")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        admin_id = decode_token(token)
    except (JWTError, ValueError):
        raise HTTPException(status_code=401, detail="Invalid token")
    user = session.get(admin_user, admin_id)
    if not user:
        raise HTTPException(status_code=401, detail="Admin not found")
    return user


admin_dependency = Annotated[admin_user, Depends(get_current_admin)]
