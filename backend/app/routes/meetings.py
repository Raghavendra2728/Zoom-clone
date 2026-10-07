from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.dependencies import get_db
from app.schemas.meeting import (
    MeetingCreate,
    MeetingResponse,
    ScheduledMeetingCreate,
)
from app.services.meeting_service import (
    create_instant_meeting,
    create_scheduled_meeting,
    get_meeting,
    get_upcoming,
)

router = APIRouter(
    prefix="/meetings",
    tags=["Meetings"],
)


@router.post(
    "/instant",
    response_model=MeetingResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_instant(
    meeting: MeetingCreate,
    db: Session = Depends(get_db),
):
    return create_instant_meeting(
        db=db,
        title=meeting.title,
    )


@router.post(
    "/schedule",
    response_model=MeetingResponse,
    status_code=status.HTTP_201_CREATED,
)
def schedule_meeting(
    meeting: ScheduledMeetingCreate,
    db: Session = Depends(get_db),
):
    return create_scheduled_meeting(
        db=db,
        title=meeting.title,
        description=meeting.description,
        scheduled_at=meeting.scheduled_at,
        duration_minutes=meeting.duration_minutes,
    )


@router.get(
    "/{meeting_id}",
    response_model=MeetingResponse,
)
def get_meeting_details(
    meeting_id: str,
    db: Session = Depends(get_db),
):
    meeting = get_meeting(db, meeting_id)

    if meeting is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Meeting not found",
        )

    return meeting


@router.get(
    "/",
    response_model=list[MeetingResponse],
)
def get_upcoming_meeting_list(
    db: Session = Depends(get_db),
):
    return get_upcoming(db)