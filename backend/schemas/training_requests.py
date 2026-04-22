"""Schemas for TrainingRequest."""
from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel
from models.training_requests import TrainingRequestStatus

class TrainingRequestBase(BaseModel):
    """Base schema for training requests."""
    title: str
    training_type: str
    provider: str
    venue: str
    date_from: date
    date_to: date
    estimated_cost: float = 0.0
    number_of_hours: int = 0
    justification: str
    training_event_id: Optional[str] = None

class TrainingRequestCreate(TrainingRequestBase):
    """Schema for creating a training request."""
    training_event_id: str

class TrainingRequestUpdate(BaseModel):
    """Schema for updating a training request status or details."""
    status: Optional[TrainingRequestStatus] = None
    remarks: Optional[str] = None
    title: Optional[str] = None
    training_type: Optional[str] = None
    provider: Optional[str] = None
    venue: Optional[str] = None
    date_from: Optional[date] = None
    date_to: Optional[date] = None
    estimated_cost: Optional[float] = None
    number_of_hours: Optional[int] = None
    justification: Optional[str] = None
    training_event_id: Optional[str] = None

class TrainingRequestRead(TrainingRequestBase):
    """Schema for reading a training request."""
    id: str
    employee_id: str
    status: TrainingRequestStatus
    remarks: Optional[str] = None
    submitted_at: datetime
    reviewed_at: Optional[datetime] = None
    reviewed_by: Optional[str] = None

    class Config:
        from_attributes = True
