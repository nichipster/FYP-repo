def test_requires_auth(client):
    assert client.get("/api/admin/testimonials").status_code == 401


def test_create_testimonial(client, admin_cookie):
    res = client.post("/api/admin/testimonials", json={
        "name": "Sarah L.",
        "role": "Lost 12kg",
        "text": "Great app!",
        "avatar": "SL",
        "sort_order": 0,
        "active": True,
    })
    assert res.status_code == 201
    assert res.json()["name"] == "Sarah L."


def test_active_filter_in_public(client, admin_cookie):
    client.post("/api/admin/testimonials", json={
        "name": "Active User", "role": "Role", "text": "Text", "avatar": "AU", "sort_order": 0, "active": True,
    })
    inactive = client.post("/api/admin/testimonials", json={
        "name": "Inactive User", "role": "Role", "text": "Text", "avatar": "IU", "sort_order": 1, "active": False,
    }).json()

    res = client.get("/api/testimonials")
    names = [t["name"] for t in res.json()]
    assert "Active User" in names
    assert "Inactive User" not in names


def test_update_testimonial(client, admin_cookie):
    t = client.post("/api/admin/testimonials", json={
        "name": "Old", "role": "R", "text": "T", "avatar": "OL", "sort_order": 0, "active": True,
    }).json()
    res = client.put(f"/api/admin/testimonials/{t['id']}", json={"name": "New"})
    assert res.status_code == 200
    assert res.json()["name"] == "New"


def test_delete_testimonial(client, admin_cookie):
    t = client.post("/api/admin/testimonials", json={
        "name": "Del", "role": "R", "text": "T", "avatar": "DL", "sort_order": 0, "active": True,
    }).json()
    res = client.delete(f"/api/admin/testimonials/{t['id']}")
    assert res.status_code == 204
