def test_get_all_empty(client):
    res = client.get("/covid")
    assert res.status_code == 200
    assert res.get_json() == []

def test_create_requires_auth(client):
    res = client.post("/covid", json={"country":"X","cases":1,"deaths":1,"recovered":0,"active":0})
    assert res.status_code in (401, 422)

def test_create_ok(client, auth_header):
    res = client.post("/covid", json={"country":"X","cases":1,"deaths":1,"recovered":0,"active":0}, headers=auth_header)
    assert res.status_code == 201
    assert "id" in res.get_json()

def test_update_ok(client, auth_header):
    add = client.post("/covid", json={"country":"U","cases":10,"deaths":2,"recovered":7,"active":1}, headers=auth_header)
    cid = add.get_json()["id"]
    up = client.put(f"/covid/{cid}", json={"cases":99}, headers=auth_header)
    assert up.status_code == 200

def test_delete_requires_admin(client, auth_header):
    add = client.post("/covid", json={"country":"U","cases":2,"deaths":0,"recovered":1,"active":1}, headers=auth_header)
    cid = add.get_json()["id"]
    res = client.delete(f"/covid/{cid}", headers=auth_header)
    assert res.status_code in (401, 403)  # your role_required likely returns 403

def test_delete_admin_ok(client, admin_header, auth_header):
    add = client.post("/covid", json={"country":"U","cases":2,"deaths":0,"recovered":1,"active":1}, headers=auth_header)
    cid = add.get_json()["id"]
    res = client.delete(f"/covid/{cid}", headers=admin_header)
    assert res.status_code == 200

