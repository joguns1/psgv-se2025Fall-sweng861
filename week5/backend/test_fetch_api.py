import pytest
import requests
from unittest.mock import patch, MagicMock
from fetch_api import fetch_and_store_covid_data
from models import CovidStat

# --- Mock Models & DB ---
class DummySession:
    def __init__(self):
        self.added = []
        self.committed = False
    def add(self, obj):
        self.added.append(obj)
    def commit(self):
        self.committed = True

class DummyCovidStat:
    def __init__(self, country, confirmed, deaths, recovered):
        self.country = country
        self.confirmed = confirmed
        self.deaths = deaths
        self.recovered = recovered

@pytest.fixture(autouse=True)
def patch_db(monkeypatch):
    # Patch db.session and CovidStat inside fetch_api
    monkeypatch.setattr("fetch_api.db", MagicMock(session=DummySession()))
    monkeypatch.setattr("fetch_api.CovidStat", DummyCovidStat)

# --- Mock Responses ---
class MockResponseValid:
    status_code = 200
    def raise_for_status(self): pass
    def json(self):
        return {
            "Countries": [
                {"Country": "USA", "TotalConfirmed": 100, "TotalDeaths": 5, "TotalRecovered": 90},
                {"Country": None, "TotalConfirmed": 50, "TotalDeaths": 2, "TotalRecovered": 40}, # invalid
            ]
        }

class MockResponseInvalid:
    status_code = 200
    def raise_for_status(self): pass
    def json(self):
        return {"WrongKey": []}

class MockResponseError:
    status_code = 500
    def raise_for_status(self): raise requests.HTTPError("500 Server Error")

# --- Tests ---
def test_fetch_and_store_valid(monkeypatch):
    monkeypatch.setattr(requests, "get", lambda url: MockResponseValid())
    fetch_and_store_covid_data()  # should run without exception

def test_fetch_and_store_invalid_key(monkeypatch):
    monkeypatch.setattr(requests, "get", lambda url: MockResponseInvalid())
    fetch_and_store_covid_data()  # should print error about missing key

def test_fetch_and_store_http_error(monkeypatch):
    monkeypatch.setattr(requests, "get", lambda url: MockResponseError())
    fetch_and_store_covid_data()  # should catch and print exception


#models.py dict test
def test_covidstat_to_dict(app):
    with app.app_context():
        stat = CovidStat(
            country="TestLand",
            cases=123,
            deaths=4,
            recovered=100,
            active=19
        )
        result = stat.to_dict()
        assert result["country"] == "TestLand"
        assert result["cases"] == 123
        assert result["deaths"] == 4
        assert result["recovered"] == 100
        assert result["active"] == 19
        assert "id" in result