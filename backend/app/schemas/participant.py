from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ParticipantCreate(BaseModel):
    meeting_id: int
    display_name: str = Field(
        min_length=1,
        max_length=100,
    )


class ParticipantResponse(BaseModel):
    id: int
    meeting_id: int
    display_name: str
    joined_at: datetime
    left_at: datetime | None

    model_config = ConfigDict(from_attributes=True)