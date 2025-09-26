import requests

def test_fetch_and_save_live_covid(client, monkeypatch):
    fake_json = {
        "country":"USA","cases":1,"deaths":2,"recovered":3,"active":4
    }
    def fake_get(url):
        class Resp:
            status_code = 200
            def json(self): return fake_json
        return Resp()
    monkeypatch.setattr(requests, "get", fake_get)
    res = client.get("/covid/fetch")
    assert res.status_code in (200,201)
    data = res.get_json()
    assert "data" in data or "message" in data

def test_fetch_live_covid_failure(client, monkeypatch):
    def fake_get(url):
        class Resp:
            status_code = 500
            def json(self): return {}
        return Resp()
    monkeypatch.setattr(requests, "get", fake_get)
    res = client.get("/covid/fetch")
    assert res.status_code == 500 or res.status_code == 502 or res.status_code == 500
