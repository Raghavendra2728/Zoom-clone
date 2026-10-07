from datetime import datetime

from sqlalchemy.orm import Session

from app.models.participant import Participant
from app.repositories.participant_repository import (
    create_participant,
    delete_participant,
    get_participant,
    get_participants_by_meeting,
)


def join_meeting(
    db: Session,
    meeting_id: int,
    display_name: str,
) -> Participant:
    participant = Participant(
        meeting_id=meeting_id,
        display_name=display_name.strip(),
        joined_at=datetime.utcnow(),
    )

    return create_participant(db, participant)


def get_meeting_participants(
    db: Session,
    meeting_id: int,
) -> list[Participant]:
    return get_participants_by_meeting(db, meeting_id)


def remove_participant(
    db: Session,
    participant_id: int,
) -> bool:
    participant = get_participant(db, participant_id)

    if participant is None:
        return False

    delete_participant(db, participant)

    return True