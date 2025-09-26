def test_register_success(client):
    res = client.post("/auth/register", json={"username": "x", "password": "y"})
    assert res.status_code == 201

def test_register_missing(client):
    res = client.post("/auth/register", json={})
    assert res.status_code == 400

def test_register_conflict(client):
    client.post("/auth/register", json={"username": "dup", "password": "p"})
    res = client.post("/auth/register", json={"username": "dup", "password": "p"})
    assert res.status_code == 409

def test_login_success(client):
    client.post("/auth/register", json={"username": "u", "password": "p"})
    res = client.post("/auth/login", json={"username": "u", "password": "p"})
    assert res.status_code == 200
    assert "access_token" in res.get_json()

def test_login_bad_password(client):
    client.post("/auth/register", json={"username": "u", "password": "p"})
    res = client.post("/auth/login", json={"username": "u", "password": "wrong"})
    assert res.status_code == 401

def test_register_duplicate_user(client):
    client.post("/auth/register", json={"username": "dupe", "password": "p"})
    res = client.post("/auth/register", json={"username": "dupe", "password": "p"})
    assert res.status_code == 409
    assert res.get_json()["msg"] == "username already exists"

def test_register_missing_fields(client):
    res = client.post("/auth/register", json={})
    assert res.status_code == 400
    assert "username and password required" in res.get_json()["msg"]

def test_login_wrong_credentials(client):
    client.post("/auth/register", json={"username": "x", "password": "y"})
    res = client.post("/auth/login", json={"username": "x", "password": "wrong"})
    assert res.status_code == 401
    assert "bad username/password" in res.get_json()["msg"]

def test_login_missing_fields(client):
    res = client.post("/auth/login", json={})
    assert res.status_code == 400
    assert "username and password required" in res.get_json()["msg"]

def test_delete_not_found(client, admin_header):
    res = client.delete("/covid/99999", headers=admin_header)
    assert res.status_code == 404 or res.get_json().get("error")
