from sqlalchemy.orm import Session

from app.models.participant import Participant


def create_participant(
    db: Session,
    participant: Participant,
) -> Participant:
    db.add(participant)
    db.commit()
    db.refresh(participant)

    return participant


def get_participants_by_meeting(
    db: Session,
    meeting_id: int,
) -> list[Participant]:
    return (
        db.query(Participant)
        .filter(Participant.meeting_id == meeting_id)
        .order_by(Participant.joined_at.asc())
        .all()
    )


def get_participant(
    db: Session,
    participant_id: int,
) -> Participant | None:
    return (
        db.query(Participant)
        .filter(Participant.id == participant_id)
        .first()
    )


def delete_participant(
    db: Session,
    participant: Participant,
) -> None:
    db.delete(participant)
    db.commit()