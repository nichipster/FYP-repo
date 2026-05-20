def test_login_success(client, admin_cookie):
    assert admin_cookie is not None


def test_login_wrong_password(client, session):
    from app.auth import hash_password
    from app.models.admin_user import admin_user

    user = admin_user(username="wrongpass", hashed_password=hash_password("correct"))
    session.add(user)
    session.commit()

    res = client.post("/api/auth/login", json={"username": "wrongpass", "password": "wrong"})
    assert res.status_code == 401


def test_login_unknown_user(client):
    res = client.post("/api/auth/login", json={"username": "nobody", "password": "x"})
    assert res.status_code == 401


def test_logout(client, admin_cookie):
    res = client.post("/api/auth/logout")
    assert res.status_code == 200


def test_get_me_authenticated(client, admin_cookie):
    res = client.get("/api/admin/me")
    assert res.status_code == 200
    data = res.json()
    assert data["username"] == "testadmin"


def test_get_me_unauthenticated(client):
    res = client.get("/api/admin/me")
    assert res.status_code == 401
