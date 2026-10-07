from sqlalchemy.orm import Session
from datetime import datetime

from app.models.meeting import Meeting
from app.repositories.meeting_repository import (
    create_meeting,
    get_meeting_by_id,
    get_upcoming_meetings,
)
from app.utils.invite_link import generate_invite_link
from app.utils.meeting_id import generate_meeting_id


def create_instant_meeting(
    db: Session,
    title: str = "Instant Meeting",
) -> Meeting:
    meeting_id = generate_meeting_id()

    while get_meeting_by_id(db, meeting_id) is not None:
        meeting_id = generate_meeting_id()

    meeting = Meeting(
        meeting_id=meeting_id,
        title=title,
        invite_link=generate_invite_link(meeting_id),
    )

    return create_meeting(db, meeting)


def create_scheduled_meeting(
    db: Session,
    title: str,
    description: str | None,
    scheduled_at: datetime,
    duration_minutes: int,
) -> Meeting:
    meeting_id = generate_meeting_id()

    while get_meeting_by_id(db, meeting_id) is not None:
        meeting_id = generate_meeting_id()

    meeting = Meeting(
        meeting_id=meeting_id,
        title=title,
        description=description,
        scheduled_at=scheduled_at,
        duration_minutes=duration_minutes,
        invite_link=generate_invite_link(meeting_id),
    )

    return create_meeting(db, meeting)


def get_meeting(
    db: Session,
    meeting_id: str,
) -> Meeting | None:
    return get_meeting_by_id(db, meeting_id)


def get_upcoming(
    db: Session,
) -> list[Meeting]:
    return get_upcoming_meetings(db)