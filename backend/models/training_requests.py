"""Training request model for employee-initiated training."""
from datetime import date, datetime
from enum import Enum
from typing import Optional, TYPE_CHECKING
from sqlmodel import Field, Relationship
from models.base import BaseModel

if TYPE_CHECKING:
    from models.employees import Employee

class TrainingRequestStatus(str, Enum):
    """Status of a training request."""
    pending = "pending"
    approved = "approved"
    rejected = "rejected"
    completed = "completed"

class TrainingRequest(BaseModel, table=True):
    """Model for employee training requests."""
    __tablename__ = "training_requests"

    employee_id: str = Field(foreign_key="employees.id", description="Link to employee")
    
    title: str = Field(max_length=255, description="Title of the training")
    training_type: str = Field(max_length=100, description="Type (e.g., Seminar, Workshop, etc.)")
    provider: str = Field(max_length=255, description="Institutional provider")
    venue: str = Field(max_length=255, description="Location/Venue")
    
    date_from: date = Field(description="Start date")
    date_to: date = Field(description="End date")
    
    estimated_cost: float = Field(default=0.0, description="Estimated cost for attendance")
    number_of_hours: int = Field(default=0, description="Number of hours")
    justification: str = Field(description="Employee's justification for the request")
    
    status: TrainingRequestStatus = Field(default=TrainingRequestStatus.pending, description="Current approval status")
    remarks: Optional[str] = Field(default=None, description="Reviewer remarks")
    
    submitted_at: datetime = Field(default_factory=datetime.utcnow, description="Timestamp of submission")
    reviewed_at: Optional[datetime] = Field(default=None, description="Timestamp of review")
    reviewed_by: Optional[str] = Field(default=None, description="ID of the user who reviewed this")

    # Optional link to system event
    training_event_id: Optional[str] = Field(default=None, foreign_key="training_events.id", description="Link to official training event if chosen")

    # Relationships
    employee: "Employee" = Relationship(back_populates="training_requests")
