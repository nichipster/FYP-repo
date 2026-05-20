def test_health(client):
    res = client.get("/api/health")
    assert res.status_code == 200


def test_faqs_empty(client):
    res = client.get("/api/faqs")
    assert res.status_code == 200
    assert res.json() == []


def test_plans_empty(client):
    res = client.get("/api/plans")
    assert res.status_code == 200
    assert res.json() == []


def test_testimonials_empty(client):
    res = client.get("/api/testimonials")
    assert res.status_code == 200
    assert res.json() == []


def test_team_empty(client):
    res = client.get("/api/team")
    assert res.status_code == 200
    assert res.json() == []


def test_meals_empty(client):
    res = client.get("/api/meals")
    assert res.status_code == 200
    assert res.json() == []


def test_settings_empty(client):
    res = client.get("/api/settings")
    assert res.status_code == 200
    assert res.json() == {}
