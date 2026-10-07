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


def test_join_meeting():
    meeting_response = client.post(
        "/meetings/instant",
        json={
            "title": "Participant Test Meeting",
        },
    )

    assert meeting_response.status_code == 201

    meeting = meeting_response.json()

    response = client.post(
        "/participants/join",
        json={
            "meeting_id": meeting["id"],
            "display_name": "Raghavendra",
        },
    )

    assert response.status_code == 201

    data = response.json()

    assert data["meeting_id"] == meeting["id"]
    assert data["display_name"] == "Raghavendra"
    assert data["id"] is not None


def test_get_meeting_participants():
    meeting_response = client.post(
        "/meetings/instant",
        json={
            "title": "Participants List Test",
        },
    )

    assert meeting_response.status_code == 201

    meeting = meeting_response.json()

    client.post(
        "/participants/join",
        json={
            "meeting_id": meeting["id"],
            "display_name": "User One",
        },
    )

    client.post(
        "/participants/join",
        json={
            "meeting_id": meeting["id"],
            "display_name": "User Two",
        },
    )

    response = client.get(
        f"/participants/meeting/{meeting['id']}",
    )

    assert response.status_code == 200

    participants = response.json()

    assert len(participants) == 2
    assert participants[0]["display_name"] == "User One"
    assert participants[1]["display_name"] == "User Two"


def test_remove_participant():
    meeting_response = client.post(
        "/meetings/instant",
        json={
            "title": "Remove Participant Test",
        },
    )

    meeting = meeting_response.json()

    join_response = client.post(
        "/participants/join",
        json={
            "meeting_id": meeting["id"],
            "display_name": "User To Remove",
        },
    )

    participant_id = join_response.json()["id"]

    response = client.delete(
        f"/participants/{participant_id}",
    )

    assert response.status_code == 204

    participants_response = client.get(
        f"/participants/meeting/{meeting['id']}",
    )

    assert participants_response.status_code == 200
    assert participants_response.json() == []