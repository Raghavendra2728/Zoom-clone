from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.dependencies import get_db
from app.schemas.participant import (
    ParticipantCreate,
    ParticipantResponse,
)
from app.services.participant_service import (
    get_meeting_participants,
    join_meeting,
    remove_participant,
)

router = APIRouter(
    prefix="/participants",
    tags=["Participants"],
)


@router.post(
    "/join",
    response_model=ParticipantResponse,
    status_code=status.HTTP_201_CREATED,
)
def join(
    participant: ParticipantCreate,
    db: Session = Depends(get_db),
):
    return join_meeting(
        db=db,
        meeting_id=participant.meeting_id,
        display_name=participant.display_name,
    )


@router.get(
    "/meeting/{meeting_id}",
    response_model=list[ParticipantResponse],
)
def get_participants(
    meeting_id: int,
    db: Session = Depends(get_db),
):
    return get_meeting_participants(
        db=db,
        meeting_id=meeting_id,
    )


@router.delete(
    "/{participant_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def remove(
    participant_id: int,
    db: Session = Depends(get_db),
):
    removed = remove_participant(
        db=db,
        participant_id=participant_id,
    )

    if not removed:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Participant not found",
        )