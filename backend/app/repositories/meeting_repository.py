from sqlalchemy.orm import Session

from app.models.meeting import Meeting


def create_meeting(
    db: Session,
    meeting: Meeting,
) -> Meeting:
    db.add(meeting)
    db.commit()
    db.refresh(meeting)

    return meeting


def get_meeting_by_id(
    db: Session,
    meeting_id: str,
) -> Meeting | None:
    return (
        db.query(Meeting)
        .filter(Meeting.meeting_id == meeting_id)
        .first()
    )


def get_upcoming_meetings(
    db: Session,
) -> list[Meeting]:
    return (
        db.query(Meeting)
        .filter(Meeting.scheduled_at.is_not(None))
        .order_by(Meeting.scheduled_at.asc())
        .all()
    )