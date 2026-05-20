MEMBER_PAYLOAD = {
    "initials": "LN",
    "name": "Nicholas",
    "role": "BACKEND DEVELOPER",
    "email": "n@example.com",
    "description": "Backend dev",
    "bg_color": "bg-emerald-500",
    "sort_order": 0,
}


def test_requires_auth(client):
    assert client.get("/api/admin/team").status_code == 401


def test_create_member(client, admin_cookie):
    res = client.post("/api/admin/team", json=MEMBER_PAYLOAD)
    assert res.status_code == 201
    assert res.json()["name"] == "Nicholas"


def test_member_appears_in_public(client, admin_cookie):
    client.post("/api/admin/team", json=MEMBER_PAYLOAD)
    res = client.get("/api/team")
    assert res.status_code == 200
    assert res.json()[0]["name"] == "Nicholas"


def test_update_member(client, admin_cookie):
    m = client.post("/api/admin/team", json=MEMBER_PAYLOAD).json()
    res = client.put(f"/api/admin/team/{m['id']}", json={"role": "TEAM LEAD"})
    assert res.status_code == 200
    assert res.json()["role"] == "TEAM LEAD"


def test_delete_member(client, admin_cookie):
    m = client.post("/api/admin/team", json=MEMBER_PAYLOAD).json()
    res = client.delete(f"/api/admin/team/{m['id']}")
    assert res.status_code == 204
