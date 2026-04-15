"""Personal Information Models - Basic Information."""
from datetime import date
from typing import Optional

from sqlmodel import SQLModel, Field, Relationship

from models.base import BaseModel


class BasicInformation(BaseModel, table=True):
    """Core personal/demographic information linked to an employee."""

    __tablename__ = "basic_information"

    employee_id: Optional[str] = Field(default=None, foreign_key="employees.id", description="Reference to employee")
    surname: str = Field(max_length=100, description="Family name")
    first_name: str = Field(max_length=100, description="Given name")
    middle_name: Optional[str] = Field(default=None, max_length=100, description="Middle name")
    name_extension: Optional[str] = Field(default=None, max_length=100, description="Name suffix (Jr., Sr., etc.)")
    date_of_birth: date = Field(description="Date of birth")
    place_of_birth: str = Field(max_length=100, description="Location of birth")
    sex: str = Field(max_length=20, description="Biological sex")
    civil_status: str = Field(max_length=20, description="Marital status")
    height: Optional[float] = Field(default=None, description="Height in meters")
    weight: Optional[float] = Field(default=None, description="Weight in kilograms")
    blood_type: Optional[str] = Field(default=None, max_length=20, description="Blood type")
    citizenship: str = Field(max_length=20, description="Country of citizenship")

    # Relationships
    employee: Optional["Employee"] = Relationship(back_populates="basic_information")
    government_ids: list["GovernmentId"] = Relationship(back_populates="basic_information")
    addresses: list["Address"] = Relationship(back_populates="basic_information")
    contact_information: Optional["ContactInformation"] = Relationship(back_populates="basic_information")
    family_details: list["FamilyDetail"] = Relationship(back_populates="basic_information")
    educational_backgrounds: list["EducationalBackground"] = Relationship(back_populates="basic_information")
    other_information: list["OtherInformation"] = Relationship(back_populates="basic_information")
    reference_records: list["ReferenceRecord"] = Relationship(back_populates="basic_information")
    primary_government_id: Optional["PrimaryGovernmentId"] = Relationship(back_populates="basic_information")
    record_completion: Optional["RecordCompletion"] = Relationship(back_populates="basic_information")
    work_experience_records: list["WorkExperienceRecord"] = Relationship(back_populates="basic_information")
    voluntary_records: list["VoluntaryRecord"] = Relationship(back_populates="basic_information")
    training_records: list["TrainingRecord"] = Relationship(back_populates="basic_information")
    civil_service_eligibilities: list["CivilServiceEligibility"] = Relationship(back_populates="basic_information")


class GovernmentId(BaseModel, table=True):
    """Government-issued identification documents."""

    __tablename__ = "government_ids"

    basic_information_id: str = Field(foreign_key="basic_information.id", description="Reference to basic information")
    id_type: str = Field(max_length=50, description="Type of ID (GSIS, PAG-IBIG, PHILHEALTH, SSS, TIN, AGENCY_EMPLOYEE)")
    id_value: str = Field(max_length=50, description="Identification number/value")

    # Relationships
    basic_information: BasicInformation = Relationship(back_populates="government_ids")


class Address(BaseModel, table=True):
    """Addresses associated with an employee."""

    __tablename__ = "addresses"

    basic_information_id: str = Field(foreign_key="basic_information.id", description="Reference to basic information")
    address_type: str = Field(max_length=20, description="Type of address (RESIDENTIAL, PERMANENT)")
    house_no: Optional[str] = Field(default=None, max_length=50, description="House number")
    street: Optional[str] = Field(default=None, max_length=100, description="Street name")
    subdivision_village: Optional[str] = Field(default=None, max_length=100, description="Subdivision or village name")
    barangay: Optional[str] = Field(default=None, max_length=100, description="Barangay (village/district)")
    city: Optional[str] = Field(default=None, max_length=100, description="City or municipality")
    province: Optional[str] = Field(default=None, max_length=100, description="Province or state")
    zip_code: Optional[str] = Field(default=None, max_length=20, description="Postal code")

    # Relationships
    basic_information: BasicInformation = Relationship(back_populates="addresses")


class ContactInformation(BaseModel, table=True):
    """Contact information for an employee."""

    __tablename__ = "contact_information"

    basic_information_id: str = Field(
        foreign_key="basic_information.id",
        unique=True,
        description="Reference to basic information (one-to-one)",
    )
    telephone_no: Optional[str] = Field(default=None, max_length=20, description="Landline telephone number")
    mobile_no: str = Field(max_length=20, description="Mobile phone number")
    email_address: str = Field(max_length=100, description="Email address")

    # Relationships
    basic_information: BasicInformation = Relationship(back_populates="contact_information")
