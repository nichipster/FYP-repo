MEAL_PAYLOAD = {
    "name": "Chicken Rice",
    "cuisine": "Hawker",
    "calories": 450,
    "protein": 32,
    "carbs": 52,
    "fat": 10,
    "emoji": "🍚",
    "tag": "Local Favourite",
    "tag_color": "bg-emerald-100 text-emerald-700",
    "sort_order": 0,
}


def test_requires_auth(client):
    assert client.get("/api/admin/meals").status_code == 401


def test_create_meal(client, admin_cookie):
    res = client.post("/api/admin/meals", json=MEAL_PAYLOAD)
    assert res.status_code == 201
    assert res.json()["name"] == "Chicken Rice"


def test_meal_appears_in_public(client, admin_cookie):
    client.post("/api/admin/meals", json=MEAL_PAYLOAD)
    res = client.get("/api/meals")
    assert res.status_code == 200
    assert res.json()[0]["name"] == "Chicken Rice"


def test_update_meal(client, admin_cookie):
    m = client.post("/api/admin/meals", json=MEAL_PAYLOAD).json()
    res = client.put(f"/api/admin/meals/{m['id']}", json={"calories": 500})
    assert res.status_code == 200
    assert res.json()["calories"] == 500


def test_delete_meal(client, admin_cookie):
    m = client.post("/api/admin/meals", json=MEAL_PAYLOAD).json()
    res = client.delete(f"/api/admin/meals/{m['id']}")
    assert res.status_code == 204
