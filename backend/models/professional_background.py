"""Professional Background Models - Work Experience, Training, Civil Service Eligibility."""
from datetime import date
from typing import Optional

from sqlmodel import SQLModel, Field, Relationship

from models.base import BaseModel


class WorkExperienceRecord(BaseModel, table=True):
    """Work experience record for an employee."""

    __tablename__ = "work_experience_records"

    basic_information_id: str = Field(foreign_key="basic_information.id", description="Reference to basic information")
    position_title: str = Field(max_length=100, description="Job position/title")
    department: str = Field(max_length=100, description="Department or division")
    monthly_salary: Optional[str] = Field(default=None, max_length=100, description="Monthly salary amount")
    salary_grade: Optional[str] = Field(default=None, max_length=50, description="Salary grade or level")
    status_of_appointment: str = Field(max_length=100, description="Status of appointment (Permanent, Contractual, etc.)")
    date_from: date = Field(description="Start date of employment")
    date_to: Optional[date] = Field(default=None, description="End date of employment")
    government_service: bool = Field(default=False, description="Whether this was government service")

    # Relationships
    basic_information: "BasicInformation" = Relationship(back_populates="work_experience_records")


class VoluntaryRecord(BaseModel, table=True):
    """Voluntary work record for an employee."""

    __tablename__ = "voluntary_records"

    basic_information_id: str = Field(foreign_key="basic_information.id", description="Reference to basic information")
    organization_name: str = Field(max_length=100, description="Name of organization")
    organization_address: str = Field(max_length=100, description="Organization address")
    date_from: date = Field(description="Start date of voluntary work")
    date_to: Optional[date] = Field(default=None, description="End date of voluntary work")
    number_of_hours: str = Field(max_length=10, description="Total number of hours volunteered")
    position: str = Field(max_length=100, description="Position held during voluntary work")

    # Relationships
    basic_information: "BasicInformation" = Relationship(back_populates="voluntary_records")


class TrainingRecord(BaseModel, table=True):
    """Learning and development/training record for an employee."""

    __tablename__ = "training_records"

    basic_information_id: str = Field(foreign_key="basic_information.id", description="Reference to basic information")
    training_title: str = Field(max_length=100, description="Title of the training/course")
    date_from: date = Field(description="Start date of training")
    date_to: date = Field(description="End date of training")
    number_of_hours: str = Field(max_length=10, description="Total number of training hours")
    training_type: str = Field(max_length=100, description="Type of training/learning development")
    conducted_by: str = Field(max_length=100, description="Organization or person conducting the training")

    # Relationships
    basic_information: "BasicInformation" = Relationship(back_populates="training_records")


class CivilServiceEligibility(BaseModel, table=True):
    """Civil service eligibility and examination records."""

    __tablename__ = "civil_service_eligibilities"

    basic_information_id: str = Field(foreign_key="basic_information.id", description="Reference to basic information")
    career_service: str = Field(max_length=100, description="Career service type/title")
    rating: str = Field(max_length=100, description="Examination rating/score")
    date_of_examination: date = Field(description="Date of civil service examination")
    place_of_examination: str = Field(max_length=100, description="Location where examination was taken")
    license_no: Optional[str] = Field(default=None, max_length=100, description="License number (if applicable)")
    date_of_validity: Optional[date] = Field(default=None, description="Expiration/validity date of the eligibility")

    # Relationships
    basic_information: "BasicInformation" = Relationship(back_populates="civil_service_eligibilities")
