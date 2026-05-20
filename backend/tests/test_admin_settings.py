def test_requires_auth(client):
    assert client.get("/api/admin/settings").status_code == 401


def test_create_setting(client, admin_cookie):
    res = client.post("/api/admin/settings", json={
        "key": "apk_url",
        "value": "https://example.com/app.apk",
        "description": "APK download URL",
    })
    assert res.status_code == 201
    assert res.json()["key"] == "apk_url"


def test_duplicate_key_rejected(client, admin_cookie):
    client.post("/api/admin/settings", json={"key": "mykey", "value": "v1"})
    res = client.post("/api/admin/settings", json={"key": "mykey", "value": "v2"})
    assert res.status_code == 409


def test_setting_appears_in_public(client, admin_cookie):
    client.post("/api/admin/settings", json={"key": "apk_url", "value": "https://example.com/app.apk"})
    res = client.get("/api/settings")
    assert res.status_code == 200
    assert res.json()["apk_url"] == "https://example.com/app.apk"


def test_update_setting(client, admin_cookie):
    client.post("/api/admin/settings", json={"key": "video_url", "value": "https://old.com"})
    res = client.put("/api/admin/settings/video_url", json={"value": "https://new.com"})
    assert res.status_code == 200
    assert res.json()["value"] == "https://new.com"


def test_delete_setting(client, admin_cookie):
    client.post("/api/admin/settings", json={"key": "del_me", "value": "x"})
    res = client.delete("/api/admin/settings/del_me")
    assert res.status_code == 204

    remaining = client.get("/api/admin/settings").json()
    assert all(s["key"] != "del_me" for s in remaining)
