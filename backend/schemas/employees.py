"""Schemas for Employee and Certificate entities."""
from datetime import date, datetime
from typing import Any, Optional

from pydantic import BaseModel, Field


# ==================== Employee Schemas ====================


class EmployeeBase(BaseModel):
    """Base schema for employees."""

    employee_no: str = Field(..., max_length=50)
    office_department: str = Field(..., max_length=100)
    position_title: str = Field(..., max_length=100)
    employment_status: str = Field(..., max_length=50)
    date_hired: date
    salary_grade: Optional[int] = None
    step_increment: Optional[int] = None


class EmployeeCreate(EmployeeBase):
    """Schema for creating employee."""

    pass


class EmployeeUpdate(BaseModel):
    """Schema for updating employee."""

    employee_no: Optional[str] = Field(None, max_length=50)
    office_department: Optional[str] = Field(None, max_length=100)
    position_title: Optional[str] = Field(None, max_length=100)
    employment_status: Optional[str] = Field(None, max_length=50)
    date_hired: Optional[date] = None
    salary_grade: Optional[int] = None
    step_increment: Optional[int] = None


class EmployeeResponse(EmployeeBase):
    """Schema for employee response."""

    id: str
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None
    is_deleted: bool

    class Config:
        from_attributes = True


class EmployeeAtomicOnboardRequest(BaseModel):
    """Payload for atomic employee onboarding submission."""

    formData: dict[str, Any]
    employeeMeta: dict[str, Any] = Field(default_factory=dict)
    user_id: Optional[str] = Field(None, description="Optional user ID to link to this employee")



# ==================== Certificate Record Schemas ====================


class CertificateRecordBase(BaseModel):
    """Base schema for certificate records."""

    certificate_type: str = Field(..., max_length=100)
    issuing_body: str = Field(..., max_length=100)
    certificate_no: str = Field(..., max_length=100)
    date_issued: date
    expiry_date: Optional[date] = None
    description: Optional[str] = None
    file: Optional[str] = Field(None, max_length=255)
    verified_by: Optional[str] = Field(None, max_length=100)
    verified_at: Optional[datetime] = None


class CertificateRecordCreate(CertificateRecordBase):
    """Schema for creating certificate record."""

    pass


class CertificateRecordUpdate(BaseModel):
    """Schema for updating certificate record."""

    certificate_type: Optional[str] = Field(None, max_length=100)
    issuing_body: Optional[str] = Field(None, max_length=100)
    certificate_no: Optional[str] = Field(None, max_length=100)
    date_issued: Optional[date] = None
    expiry_date: Optional[date] = None
    description: Optional[str] = None
    file: Optional[str] = Field(None, max_length=255)
    verified_by: Optional[str] = Field(None, max_length=100)
    verified_at: Optional[datetime] = None


class CertificateRecordResponse(CertificateRecordBase):
    """Schema for certificate record response."""

    id: str
    employee_id: str
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None
    is_deleted: bool

    class Config:
        from_attributes = True
