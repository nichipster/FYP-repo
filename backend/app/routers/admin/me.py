from fastapi import APIRouter

from app.dependencies import admin_dependency
from app.schemas.auth import AdminRead

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/me", response_model=AdminRead)
def get_me(current_admin: admin_dependency):
    return AdminRead(id=current_admin.id, username=current_admin.username)
