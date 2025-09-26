# conftest.py
import os
import sys
import tempfile
import json
import pytest

from flask import Flask
from flask_sqlalchemy import SQLAlchemy

# Import your real app and db
import sys
# Add Week3 folder to Python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../Week3")))
from app import app as real_app, db as real_db

@pytest.fixture()
def app():
    # Make a fresh test app based on Week3 but with a TEMP DB and TESTING on
    db_fd, db_path = tempfile.mkstemp()
    real_app.config.update(
        TESTING=True,
        SQLALCHEMY_DATABASE_URI=f"sqlite:///{db_path}",
        JWT_SECRET_KEY="test-jwt",
        WTF_CSRF_ENABLED=False,
    )
    with real_app.app_context():
        real_db.drop_all()
        real_db.create_all()
    yield real_app
    os.close(db_fd)
    os.remove(db_path)

@pytest.fixture()
def client(app):
    return app.test_client()

@pytest.fixture()
def auth_header(client):
    # Register and login a normal user, return header
    client.post("/auth/register", json={"username": "u1", "password": "p1"})
    res = client.post("/auth/login", json={"username": "u1", "password": "p1"})
    token = res.get_json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture()
def admin_header(client):
    # Create an admin (if your Week3 gives role=user by default, you can promote via DB)
    client.post("/auth/register", json={"username": "admin", "password": "p2"})
    # Manually promote to admin in DB for testing
    from models import User
    from extensions import db
    with real_app.app_context():
        admin = User.query.filter_by(username="admin").first()
        admin.role = "admin"
        db.session.commit()
    res = client.post("/auth/login", json={"username": "admin", "password": "p2"})
    token = res.get_json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
