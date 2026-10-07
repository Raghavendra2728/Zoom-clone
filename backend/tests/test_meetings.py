from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database.base import Base
from app.dependencies import get_db
from app.main import app


TEST_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

TestingSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


def override_get_db():
    db = TestingSessionLocal()

    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db

Base.metadata.create_all(bind=engine)

client = TestClient(app)


def test_create_instant_meeting():
    response = client.post(
        "/meetings/instant",
        json={
            "title": "Test Meeting",
        },
    )

    assert response.status_code == 201

    data = response.json()

    assert data["title"] == "Test Meeting"
    assert len(data["meeting_id"]) == 10
    assert data["invite_link"].endswith(
        f"/meeting/{data['meeting_id']}"
    )


def test_get_meeting():
    create_response = client.post(
        "/meetings/instant",
        json={
            "title": "Meeting To Retrieve",
        },
    )

    assert create_response.status_code == 201

    meeting_id = create_response.json()["meeting_id"]

    response = client.get(
        f"/meetings/{meeting_id}",
    )

    assert response.status_code == 200

    data = response.json()

    assert data["meeting_id"] == meeting_id
    assert data["title"] == "Meeting To Retrieve"


def test_get_nonexistent_meeting():
    response = client.get(
        "/meetings/9999999999",
    )

    assert response.status_code == 404