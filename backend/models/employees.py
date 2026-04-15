"""Employee and Certificate Models."""
from datetime import date, datetime
from typing import Optional

from sqlmodel import SQLModel, Field, Relationship

from models.base import BaseModel


class Employee(BaseModel, table=True):
    """Employee record with employment details."""

    __tablename__ = "employees"

    employee_no: str = Field(unique=True, max_length=50, description="Employee number/ID")
    office_department: str = Field(max_length=100, description="Office or department assignment")
    position_title: str = Field(max_length=100, description="Current position/job title")
    employment_status: str = Field(max_length=50, description="Employment status (Permanent, Contractual, etc.)")
    date_hired: date = Field(description="Date when hired at this organization")

    # Relationships
    basic_information: Optional["BasicInformation"] = Relationship(back_populates="employee")
    certificate_records: list["CertificateRecord"] = Relationship(back_populates="employee")


class CertificateRecord(BaseModel, table=True):
    """Certificate or Memorandum of Agreement (MOA) records for employees."""

    __tablename__ = "certificate_records"

    employee_id: str = Field(foreign_key="employees.id", description="Reference to employee")
    certificate_type: str = Field(max_length=100, description="Type of certificate or MOA")
    issuing_body: str = Field(max_length=100, description="Organization that issued the certificate")
    certificate_no: str = Field(max_length=100, description="Certificate or document number")
    date_issued: date = Field(description="Date certificate was issued")
    expiry_date: Optional[date] = Field(default=None, description="Expiration date of certificate")
    description: Optional[str] = Field(default=None, description="Additional description or notes")
    file: Optional[str] = Field(default=None, max_length=255, description="File path or URL to certificate document")
    verified_by: Optional[str] = Field(default=None, max_length=100, description="User or role that verified the certificate")
    verified_at: Optional[datetime] = Field(default=None, description="Timestamp when the certificate was verified")

    # Relationships
    employee: Employee = Relationship(back_populates="certificate_records")
