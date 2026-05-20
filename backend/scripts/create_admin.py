"""Create an admin user. Usage: python scripts/create_admin.py <username> <password>"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlmodel import Session, select

from app.auth import hash_password
from app.database import engine
from app.models.admin_user import admin_user


def create_admin(username: str, password: str) -> None:
    with Session(engine) as session:
        existing = session.exec(select(admin_user).where(admin_user.username == username)).first()
        if existing:
            print(f"Admin '{username}' already exists.")
            return
        user = admin_user(username=username, hashed_password=hash_password(password))
        session.add(user)
        session.commit()
        print(f"Admin '{username}' created successfully.")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python scripts/create_admin.py <username> <password>")
        sys.exit(1)
    create_admin(sys.argv[1], sys.argv[2])
