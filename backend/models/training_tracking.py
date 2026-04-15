"""Training tracking models for assignable training events and participants."""
from datetime import date
from typing import Optional

from sqlalchemy import UniqueConstraint
from sqlmodel import Field, Relationship

from models.base import BaseModel


class TrainingEvent(BaseModel, table=True):
    """Training event that can be assigned to many employees."""

    __tablename__ = "training_events"

    training_title: str = Field(max_length=150, description="Title of the training event")
    training_type: str = Field(max_length=100, description="Type/category of training")
    status: str = Field(max_length=50, description="Current status of the training")
    conducted_by: str = Field(max_length=150, description="Organization/person conducting the training")
    venue: str = Field(max_length=150, description="Venue/platform of the training")
    date_from: date = Field(description="Training start date")
    date_to: date = Field(description="Training end date")
    hours: int = Field(default=0, ge=0, description="Total training hours")

    participants: list["TrainingEventParticipant"] = Relationship(back_populates="training_event")


class TrainingEventParticipant(BaseModel, table=True):
    """Employees assigned to a training event."""

    __tablename__ = "training_event_participants"
    __table_args__ = (
        UniqueConstraint(
            "training_event_id",
            "employee_id",
            name="uq_training_event_participant_employee",
        ),
    )

    training_event_id: str = Field(
        foreign_key="training_events.id",
        description="Reference to training event",
    )
    employee_id: str = Field(
        foreign_key="employees.id",
        description="Reference to employee",
    )
    assignment_status: str = Field(
        default="Assigned",
        max_length=50,
        description="Assignment status",
    )
    completion_status: str = Field(
        default="Not Started",
        max_length=50,
        description="Completion status",
    )
    remarks: Optional[str] = Field(default=None, max_length=255, description="Optional remarks")

    training_event: TrainingEvent = Relationship(back_populates="participants")
