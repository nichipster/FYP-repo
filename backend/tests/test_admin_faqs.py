def test_list_categories_requires_auth(client):
    res = client.get("/api/admin/faq-categories")
    assert res.status_code == 401


def test_create_category(client, admin_cookie):
    res = client.post("/api/admin/faq-categories", json={"name": "General", "sort_order": 0})
    assert res.status_code == 201
    data = res.json()
    assert data["name"] == "General"
    assert data["id"] is not None


def test_update_category(client, admin_cookie):
    create = client.post("/api/admin/faq-categories", json={"name": "Old", "sort_order": 0})
    cat_id = create.json()["id"]

    res = client.put(f"/api/admin/faq-categories/{cat_id}", json={"name": "New"})
    assert res.status_code == 200
    assert res.json()["name"] == "New"


def test_delete_category(client, admin_cookie):
    create = client.post("/api/admin/faq-categories", json={"name": "ToDelete", "sort_order": 0})
    cat_id = create.json()["id"]

    res = client.delete(f"/api/admin/faq-categories/{cat_id}")
    assert res.status_code == 204

    remaining = client.get("/api/admin/faq-categories")
    assert all(c["id"] != cat_id for c in remaining.json())


def test_create_faq_item(client, admin_cookie):
    cat = client.post("/api/admin/faq-categories", json={"name": "Cat", "sort_order": 0}).json()
    res = client.post("/api/admin/faqs", json={
        "category_id": cat["id"],
        "question": "What?",
        "answer": "This.",
        "sort_order": 0,
    })
    assert res.status_code == 201
    assert res.json()["question"] == "What?"


def test_create_faq_item_invalid_category(client, admin_cookie):
    res = client.post("/api/admin/faqs", json={
        "category_id": 9999,
        "question": "Q",
        "answer": "A",
    })
    assert res.status_code == 404


def test_faq_appears_in_public(client, admin_cookie):
    cat = client.post("/api/admin/faq-categories", json={"name": "General", "sort_order": 0}).json()
    client.post("/api/admin/faqs", json={"category_id": cat["id"], "question": "Q?", "answer": "A.", "sort_order": 0})

    res = client.get("/api/faqs")
    assert res.status_code == 200
    groups = res.json()
    assert len(groups) == 1
    assert groups[0]["category"] == "General"
    assert groups[0]["items"][0]["question"] == "Q?"
