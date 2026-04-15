"""Pydantic schemas for Personal Background entities."""
from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, Field


# ==================== Family Detail Schemas ====================


class FamilyDetailBase(BaseModel):
    """Base schema for family details."""

    surname: str = Field(..., max_length=100)
    first_name: str = Field(..., max_length=100)
    middle_name: Optional[str] = Field(None, max_length=100)
    name_extension: Optional[str] = Field(None, max_length=100)
    date_of_birth: Optional[date] = None
    occupation: Optional[str] = Field(None, max_length=100)
    employee_business_name: Optional[str] = Field(None, max_length=100)
    business_address: Optional[str] = Field(None, max_length=100)
    telephone_no: Optional[str] = Field(None, max_length=20)


class FamilyDetailCreate(FamilyDetailBase):
    """Schema for creating family detail."""

    pass


class FamilyDetailUpdate(BaseModel):
    """Schema for updating family detail."""

    surname: Optional[str] = Field(None, max_length=100)
    first_name: Optional[str] = Field(None, max_length=100)
    middle_name: Optional[str] = Field(None, max_length=100)
    name_extension: Optional[str] = Field(None, max_length=100)
    date_of_birth: Optional[date] = None
    occupation: Optional[str] = Field(None, max_length=100)
    employee_business_name: Optional[str] = Field(None, max_length=100)
    business_address: Optional[str] = Field(None, max_length=100)
    telephone_no: Optional[str] = Field(None, max_length=20)


class FamilyDetailResponse(FamilyDetailBase):
    """Schema for family detail response."""

    id: str
    basic_information_id: str
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None
    is_deleted: bool

    class Config:
        from_attributes = True


# ==================== Educational Background Schemas ====================


class EducationalBackgroundBase(BaseModel):
    """Base schema for educational background."""

    level: str = Field(..., max_length=100)
    school_name: str = Field(..., max_length=100)
    degree_course: Optional[str] = Field(None, max_length=100)
    period_from: date
    period_to: Optional[date] = None
    highest_level_attained: Optional[str] = Field(None, max_length=100)
    year_graduated: Optional[str] = Field(None, max_length=10)
    academic_awards: Optional[str] = Field(None, max_length=100)


class EducationalBackgroundCreate(EducationalBackgroundBase):
    """Schema for creating educational background."""

    pass


class EducationalBackgroundUpdate(BaseModel):
    """Schema for updating educational background."""

    level: Optional[str] = Field(None, max_length=100)
    school_name: Optional[str] = Field(None, max_length=100)
    degree_course: Optional[str] = Field(None, max_length=100)
    period_from: Optional[date] = None
    period_to: Optional[date] = None
    highest_level_attained: Optional[str] = Field(None, max_length=100)
    year_graduated: Optional[str] = Field(None, max_length=10)
    academic_awards: Optional[str] = Field(None, max_length=100)


class EducationalBackgroundResponse(EducationalBackgroundBase):
    """Schema for educational background response."""

    id: str
    basic_information_id: str
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None
    is_deleted: bool

    class Config:
        from_attributes = True


# ==================== Other Information Schemas ====================


class OtherInformationBase(BaseModel):
    """Base schema for other information."""

    info_type: str = Field(..., max_length=50)
    information: str = Field(..., max_length=250)


class OtherInformationCreate(OtherInformationBase):
    """Schema for creating other information."""

    pass


class OtherInformationUpdate(BaseModel):
    """Schema for updating other information."""

    info_type: Optional[str] = Field(None, max_length=50)
    information: Optional[str] = Field(None, max_length=250)


class OtherInformationResponse(OtherInformationBase):
    """Schema for other information response."""

    id: str
    basic_information_id: str
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None
    is_deleted: bool

    class Config:
        from_attributes = True


# ==================== Reference Record Schemas ====================


class ReferenceRecordBase(BaseModel):
    """Base schema for reference records."""

    name: str = Field(..., max_length=100)
    address: str = Field(..., max_length=100)
    telephone_no: str = Field(..., max_length=20)


class ReferenceRecordCreate(ReferenceRecordBase):
    """Schema for creating reference record."""

    pass


class ReferenceRecordUpdate(BaseModel):
    """Schema for updating reference record."""

    name: Optional[str] = Field(None, max_length=100)
    address: Optional[str] = Field(None, max_length=100)
    telephone_no: Optional[str] = Field(None, max_length=20)


class ReferenceRecordResponse(ReferenceRecordBase):
    """Schema for reference record response."""

    id: str
    basic_information_id: str
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None
    is_deleted: bool

    class Config:
        from_attributes = True


# ==================== Primary Government ID Schemas ====================


class PrimaryGovernmentIdBase(BaseModel):
    """Base schema for primary government ID."""

    id_type: str = Field(..., max_length=100)
    id_number: str = Field(..., max_length=100)
    date_of_issuance: date
    place_of_issuance: str = Field(..., max_length=100)


class PrimaryGovernmentIdCreate(PrimaryGovernmentIdBase):
    """Schema for creating primary government ID."""

    pass


class PrimaryGovernmentIdUpdate(BaseModel):
    """Schema for updating primary government ID."""

    id_type: Optional[str] = Field(None, max_length=100)
    id_number: Optional[str] = Field(None, max_length=100)
    date_of_issuance: Optional[date] = None
    place_of_issuance: Optional[str] = Field(None, max_length=100)


class PrimaryGovernmentIdResponse(PrimaryGovernmentIdBase):
    """Schema for primary government ID response."""

    id: str
    basic_information_id: str
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None
    is_deleted: bool

    class Config:
        from_attributes = True


# ==================== Record Completion Schemas ====================


class RecordCompletionBase(BaseModel):
    """Base schema for record completion."""

    date_of_accomplishment: date


class RecordCompletionCreate(RecordCompletionBase):
    """Schema for creating record completion."""

    pass


class RecordCompletionUpdate(BaseModel):
    """Schema for updating record completion."""

    date_of_accomplishment: Optional[date] = None


class RecordCompletionResponse(RecordCompletionBase):
    """Schema for record completion response."""

    id: str
    basic_information_id: str
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None
    is_deleted: bool

    class Config:
        from_attributes = True
