"""Pydantic schemas for Personal Information entities."""
from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


# ==================== Basic Information Schemas ====================


class BasicInformationBase(BaseModel):
    """Base schema for basic information."""

    surname: str = Field(..., max_length=100)
    first_name: str = Field(..., max_length=100)
    middle_name: Optional[str] = Field(None, max_length=100)
    name_extension: Optional[str] = Field(None, max_length=100)
    date_of_birth: date
    place_of_birth: str = Field(..., max_length=100)
    sex: str = Field(..., max_length=20)
    civil_status: str = Field(..., max_length=20)
    height: Optional[float] = None
    weight: Optional[float] = None
    blood_type: Optional[str] = Field(None, max_length=20)
    citizenship: str = Field(..., max_length=20)


class BasicInformationCreate(BasicInformationBase):
    """Schema for creating basic information."""

    pass


class BasicInformationUpdate(BaseModel):
    """Schema for updating basic information."""

    surname: Optional[str] = Field(None, max_length=100)
    first_name: Optional[str] = Field(None, max_length=100)
    middle_name: Optional[str] = Field(None, max_length=100)
    name_extension: Optional[str] = Field(None, max_length=100)
    date_of_birth: Optional[date] = None
    place_of_birth: Optional[str] = Field(None, max_length=100)
    sex: Optional[str] = Field(None, max_length=20)
    civil_status: Optional[str] = Field(None, max_length=20)
    height: Optional[float] = None
    weight: Optional[float] = None
    blood_type: Optional[str] = Field(None, max_length=20)
    citizenship: Optional[str] = Field(None, max_length=20)


class BasicInformationResponse(BasicInformationBase):
    """Schema for basic information response."""

    id: str
    employee_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None
    is_deleted: bool

    class Config:
        from_attributes = True


# ==================== Government ID Schemas ====================


class GovernmentIdBase(BaseModel):
    """Base schema for government IDs."""

    id_type: str = Field(..., max_length=50)
    id_value: str = Field(..., max_length=50)


class GovernmentIdCreate(GovernmentIdBase):
    """Schema for creating government ID."""

    pass


class GovernmentIdUpdate(BaseModel):
    """Schema for updating government ID."""

    id_type: Optional[str] = Field(None, max_length=50)
    id_value: Optional[str] = Field(None, max_length=50)


class GovernmentIdResponse(GovernmentIdBase):
    """Schema for government ID response."""

    id: str
    basic_information_id: str
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None
    is_deleted: bool

    class Config:
        from_attributes = True


# ==================== Address Schemas ====================


class AddressBase(BaseModel):
    """Base schema for addresses."""

    address_type: str = Field(..., max_length=20)
    house_no: Optional[str] = Field(None, max_length=50)
    street: Optional[str] = Field(None, max_length=100)
    subdivision_village: Optional[str] = Field(None, max_length=100)
    barangay: Optional[str] = Field(None, max_length=100)
    city: Optional[str] = Field(None, max_length=100)
    province: Optional[str] = Field(None, max_length=100)
    zip_code: Optional[str] = Field(None, max_length=20)


class AddressCreate(AddressBase):
    """Schema for creating address."""

    pass


class AddressUpdate(BaseModel):
    """Schema for updating address."""

    address_type: Optional[str] = Field(None, max_length=20)
    house_no: Optional[str] = Field(None, max_length=50)
    street: Optional[str] = Field(None, max_length=100)
    subdivision_village: Optional[str] = Field(None, max_length=100)
    barangay: Optional[str] = Field(None, max_length=100)
    city: Optional[str] = Field(None, max_length=100)
    province: Optional[str] = Field(None, max_length=100)
    zip_code: Optional[str] = Field(None, max_length=20)


class AddressResponse(AddressBase):
    """Schema for address response."""

    id: str
    basic_information_id: str
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None
    is_deleted: bool

    class Config:
        from_attributes = True


# ==================== Contact Information Schemas ====================


class ContactInformationBase(BaseModel):
    """Base schema for contact information."""

    telephone_no: Optional[str] = Field(None, max_length=20)
    mobile_no: str = Field(..., max_length=20)
    email_address: str = Field(..., max_length=100)


class ContactInformationCreate(ContactInformationBase):
    """Schema for creating contact information."""

    pass


class ContactInformationUpdate(BaseModel):
    """Schema for updating contact information."""

    telephone_no: Optional[str] = Field(None, max_length=20)
    mobile_no: Optional[str] = Field(None, max_length=20)
    email_address: Optional[str] = Field(None, max_length=100)


class ContactInformationResponse(ContactInformationBase):
    """Schema for contact information response."""

    id: str
    basic_information_id: str
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None
    is_deleted: bool

    class Config:
        from_attributes = True
