from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class MeetingCreate(BaseModel):
    title: str = Field(
        default="Instant Meeting",
        min_length=1,
        max_length=255,
    )

class ScheduledMeetingCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    description: str | None = None
    scheduled_at: datetime
    duration_minutes: int = Field(gt=0, le=1440)


class MeetingResponse(BaseModel):
    id: int
    meeting_id: str
    title: str
    description: str | None
    scheduled_at: datetime | None
    duration_minutes: int | None
    invite_link: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)