"""Pydantic schemas for training tracking entities."""
from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, Field


class TrainingEventParticipantResponse(BaseModel):
    """Schema for assigned participant response."""

    id: str
    training_event_id: str
    employee_id: str
    employee_no: str
    name: str
    office_department: str
    assignment_status: str
    completion_status: str
    remarks: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None
    is_deleted: bool


class TrainingEventBase(BaseModel):
    """Base schema for training events."""

    training_title: str = Field(..., max_length=150)
    training_type: str = Field(..., max_length=100)
    status: str = Field(..., max_length=50)
    conducted_by: str = Field(..., max_length=150)
    venue: str = Field(..., max_length=150)
    date_from: date
    date_to: date
    hours: int = Field(..., ge=0)


class TrainingEventCreate(TrainingEventBase):
    """Schema for creating training events."""

    participant_employee_ids: list[str] = Field(default_factory=list)


class TrainingEventUpdate(BaseModel):
    """Schema for updating training events."""

    training_title: Optional[str] = Field(None, max_length=150)
    training_type: Optional[str] = Field(None, max_length=100)
    status: Optional[str] = Field(None, max_length=50)
    conducted_by: Optional[str] = Field(None, max_length=150)
    venue: Optional[str] = Field(None, max_length=150)
    date_from: Optional[date] = None
    date_to: Optional[date] = None
    hours: Optional[int] = Field(None, ge=0)


class TrainingEventResponse(TrainingEventBase):
    """Schema for training event response."""

    id: str
    participant_count: int
    participants: list[TrainingEventParticipantResponse]
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None
    is_deleted: bool

    class Config:
        from_attributes = True


class TrainingEventParticipantAssignRequest(BaseModel):
    """Schema for assigning participants to a training event."""

    employee_ids: list[str] = Field(default_factory=list)
