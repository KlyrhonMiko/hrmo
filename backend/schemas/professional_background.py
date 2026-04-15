"""Pydantic schemas for Professional Background entities."""
from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, Field


# ==================== Work Experience Schemas ====================


class WorkExperienceBase(BaseModel):
    """Base schema for work experience."""

    position_title: str = Field(..., max_length=100)
    department: str = Field(..., max_length=100)
    monthly_salary: Optional[str] = Field(None, max_length=100)
    salary_grade: Optional[str] = Field(None, max_length=50)
    status_of_appointment: str = Field(..., max_length=100)
    date_from: date
    date_to: Optional[date] = None
    government_service: bool = False


class WorkExperienceCreate(WorkExperienceBase):
    """Schema for creating work experience."""

    pass


class WorkExperienceUpdate(BaseModel):
    """Schema for updating work experience."""

    position_title: Optional[str] = Field(None, max_length=100)
    department: Optional[str] = Field(None, max_length=100)
    monthly_salary: Optional[str] = Field(None, max_length=100)
    salary_grade: Optional[str] = Field(None, max_length=50)
    status_of_appointment: Optional[str] = Field(None, max_length=100)
    date_from: Optional[date] = None
    date_to: Optional[date] = None
    government_service: Optional[bool] = None


class WorkExperienceResponse(WorkExperienceBase):
    """Schema for work experience response."""

    id: str
    basic_information_id: str
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None
    is_deleted: bool

    class Config:
        from_attributes = True


# ==================== Voluntary Work Schemas ====================


class VoluntaryWorkBase(BaseModel):
    """Base schema for voluntary work."""

    organization_name: str = Field(..., max_length=100)
    organization_address: str = Field(..., max_length=100)
    date_from: date
    date_to: Optional[date] = None
    number_of_hours: str = Field(..., max_length=10)
    position: str = Field(..., max_length=100)


class VoluntaryWorkCreate(VoluntaryWorkBase):
    """Schema for creating voluntary work."""

    pass


class VoluntaryWorkUpdate(BaseModel):
    """Schema for updating voluntary work."""

    organization_name: Optional[str] = Field(None, max_length=100)
    organization_address: Optional[str] = Field(None, max_length=100)
    date_from: Optional[date] = None
    date_to: Optional[date] = None
    number_of_hours: Optional[str] = Field(None, max_length=10)
    position: Optional[str] = Field(None, max_length=100)


class VoluntaryWorkResponse(VoluntaryWorkBase):
    """Schema for voluntary work response."""

    id: str
    basic_information_id: str
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None
    is_deleted: bool

    class Config:
        from_attributes = True


# ==================== Training Schemas ====================


class TrainingBase(BaseModel):
    """Base schema for training."""

    training_title: str = Field(..., max_length=100)
    date_from: date
    date_to: date
    number_of_hours: str = Field(..., max_length=10)
    training_type: str = Field(..., max_length=100)
    conducted_by: str = Field(..., max_length=100)


class TrainingCreate(TrainingBase):
    """Schema for creating training."""

    pass


class TrainingUpdate(BaseModel):
    """Schema for updating training."""

    training_title: Optional[str] = Field(None, max_length=100)
    date_from: Optional[date] = None
    date_to: Optional[date] = None
    number_of_hours: Optional[str] = Field(None, max_length=10)
    training_type: Optional[str] = Field(None, max_length=100)
    conducted_by: Optional[str] = Field(None, max_length=100)


class TrainingResponse(TrainingBase):
    """Schema for training response."""

    id: str
    basic_information_id: str
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None
    is_deleted: bool

    class Config:
        from_attributes = True


# ==================== Civil Service Eligibility Schemas ====================


class CivilServiceEligibilityBase(BaseModel):
    """Base schema for civil service eligibility."""

    career_service: str = Field(..., max_length=100)
    rating: str = Field(..., max_length=100)
    date_of_examination: date
    place_of_examination: str = Field(..., max_length=100)
    license_no: Optional[str] = Field(None, max_length=100)
    date_of_validity: Optional[date] = None


class CivilServiceEligibilityCreate(CivilServiceEligibilityBase):
    """Schema for creating civil service eligibility."""

    pass


class CivilServiceEligibilityUpdate(BaseModel):
    """Schema for updating civil service eligibility."""

    career_service: Optional[str] = Field(None, max_length=100)
    rating: Optional[str] = Field(None, max_length=100)
    date_of_examination: Optional[date] = None
    place_of_examination: Optional[str] = Field(None, max_length=100)
    license_no: Optional[str] = Field(None, max_length=100)
    date_of_validity: Optional[date] = None


class CivilServiceEligibilityResponse(CivilServiceEligibilityBase):
    """Schema for civil service eligibility response."""

    id: str
    basic_information_id: str
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None
    is_deleted: bool

    class Config:
        from_attributes = True
