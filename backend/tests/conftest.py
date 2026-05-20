import pytest
from fastapi.testclient import TestClient
from sqlalchemy.pool import StaticPool
from sqlmodel import Session, SQLModel, create_engine

from app.auth import hash_password
from app.database import get_session
from app.main import app
from app.models.admin_user import admin_user  # noqa: F401 — registers metadata
from app.models.audit_log import admin_audit_log  # noqa: F401
from app.models.faq import faq_category, faq_item  # noqa: F401
from app.models.plan import plan_feature, subscription_plan  # noqa: F401
from app.models.sample_meal import sample_meal  # noqa: F401
from app.models.site_setting import site_setting  # noqa: F401
from app.models.team_member import team_member  # noqa: F401
from app.models.testimonial import testimonial  # noqa: F401


@pytest.fixture(name="session")
def session_fixture():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session
    SQLModel.metadata.drop_all(engine)


@pytest.fixture(name="client")
def client_fixture(session: Session):
    def override_get_session():
        yield session

    app.dependency_overrides[get_session] = override_get_session
    with TestClient(app, raise_server_exceptions=False) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture(name="admin_cookie")
def admin_cookie_fixture(client: TestClient, session: Session):
    user = admin_user(username="testadmin", hashed_password=hash_password("testpass"))
    session.add(user)
    session.commit()
    res = client.post("/api/auth/login", json={"username": "testadmin", "password": "testpass"})
    assert res.status_code == 200, res.json()
    return client.cookies.get("admin_token")
