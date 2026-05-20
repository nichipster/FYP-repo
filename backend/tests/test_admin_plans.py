def test_list_plans_requires_auth(client):
    res = client.get("/api/admin/plans")
    assert res.status_code == 401


def test_create_plan(client, admin_cookie):
    res = client.post("/api/admin/plans", json={
        "name": "Free",
        "price_display": "S$0",
        "period": "forever",
        "highlight": False,
        "sort_order": 0,
    })
    assert res.status_code == 201
    data = res.json()
    assert data["name"] == "Free"
    assert data["features"] == []


def test_add_feature_to_plan(client, admin_cookie):
    plan = client.post("/api/admin/plans", json={
        "name": "Pro",
        "price_display": "S$9.90",
        "period": "per month",
        "highlight": True,
        "sort_order": 1,
    }).json()

    res = client.post("/api/admin/plan-features", json={
        "plan_id": plan["id"],
        "label": "AI recommendations",
        "included": True,
        "sort_order": 0,
    })
    assert res.status_code == 201
    assert res.json()["label"] == "AI recommendations"


def test_plans_appear_in_public(client, admin_cookie):
    plan = client.post("/api/admin/plans", json={
        "name": "Free",
        "price_display": "S$0",
        "period": "forever",
        "sort_order": 0,
    }).json()
    client.post("/api/admin/plan-features", json={
        "plan_id": plan["id"],
        "label": "Basic logging",
        "included": True,
        "sort_order": 0,
    })

    res = client.get("/api/plans")
    assert res.status_code == 200
    plans = res.json()
    assert plans[0]["name"] == "Free"
    assert len(plans[0]["features"]) == 1


def test_delete_plan(client, admin_cookie):
    plan = client.post("/api/admin/plans", json={
        "name": "Temp",
        "price_display": "S$1",
        "period": "month",
        "sort_order": 99,
    }).json()
    res = client.delete(f"/api/admin/plans/{plan['id']}")
    assert res.status_code == 204
