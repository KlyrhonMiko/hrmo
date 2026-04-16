"""Personal Background Models - Family, Education, Other Information."""

from datetime import date
from typing import TYPE_CHECKING, Optional

from sqlmodel import Field, Relationship

from models.base import BaseModel

if TYPE_CHECKING:
    from models.personal_information import BasicInformation


class FamilyDetail(BaseModel, table=True):
    """Family member information for an employee."""

    __tablename__ = "family_details"

    basic_information_id: str = Field(foreign_key="basic_information.id", description="Reference to basic information")
    surname: str = Field(max_length=100, description="Family member surname")
    first_name: str = Field(max_length=100, description="Family member first name")
    middle_name: Optional[str] = Field(default=None, max_length=100, description="Family member middle name")
    name_extension: Optional[str] = Field(default=None, max_length=100, description="Family member name suffix")
    date_of_birth: Optional[date] = Field(default=None, description="Family member date of birth")
    occupation: Optional[str] = Field(default=None, max_length=100, description="Family member occupation")
    employee_business_name: Optional[str] = Field(default=None, max_length=100, description="Employer or business name")
    business_address: Optional[str] = Field(default=None, max_length=100, description="Business address")
    telephone_no: Optional[str] = Field(default=None, max_length=20, description="Contact telephone number")

    # Relationships
    basic_information: "BasicInformation" = Relationship(back_populates="family_details")


class EducationalBackground(BaseModel, table=True):
    """Educational background and qualifications for an employee."""

    __tablename__ = "educational_backgrounds"

    basic_information_id: str = Field(foreign_key="basic_information.id", description="Reference to basic information")
    level: str = Field(max_length=100, description="Educational level (Elementary, Secondary, College, etc.)")
    school_name: str = Field(max_length=100, description="Name of school/institution")
    degree_course: Optional[str] = Field(default=None, max_length=100, description="Degree or course completed")
    period_from: date = Field(description="Start date of attendance")
    period_to: Optional[date] = Field(default=None, description="End date of attendance")
    highest_level_attained: Optional[str] = Field(default=None, max_length=100, description="Highest level completed")
    year_graduated: Optional[str] = Field(default=None, max_length=10, description="Year of graduation")
    academic_awards: Optional[str] = Field(default=None, max_length=100, description="Academic honors or awards")

    # Relationships
    basic_information: "BasicInformation" = Relationship(back_populates="educational_backgrounds")


class OtherInformation(BaseModel, table=True):
    """Other information such as special skills, recognitions, and memberships."""

    __tablename__ = "other_information"

    basic_information_id: str = Field(foreign_key="basic_information.id", description="Reference to basic information")
    info_type: str = Field(
        max_length=50,
        description="Type of information (special_skills, non_academic_recognitions, organization_memberships)",
    )
    information: str = Field(max_length=250, description="Details of the information")

    # Relationships
    basic_information: "BasicInformation" = Relationship(back_populates="other_information")


class ReferenceRecord(BaseModel, table=True):
    """Reference contacts for an employee."""

    __tablename__ = "reference_records"

    basic_information_id: str = Field(foreign_key="basic_information.id", description="Reference to basic information")
    name: str = Field(max_length=100, description="Reference contact name")
    address: str = Field(max_length=100, description="Reference contact address")
    telephone_no: str = Field(max_length=20, description="Reference contact telephone number")

    # Relationships
    basic_information: "BasicInformation" = Relationship(back_populates="reference_records")


class PrimaryGovernmentId(BaseModel, table=True):
    """Primary government-issued identification for an employee."""

    __tablename__ = "primary_government_ids"

    basic_information_id: str = Field(
        foreign_key="basic_information.id",
        unique=True,
        description="Reference to basic information (one-to-one)",
    )
    id_type: str = Field(max_length=100, description="Type of primary government ID")
    id_number: str = Field(max_length=100, description="Government ID number")
    date_of_issuance: date = Field(description="Date the ID was issued")
    place_of_issuance: str = Field(max_length=100, description="Location where ID was issued")

    # Relationships
    basic_information: "BasicInformation" = Relationship(back_populates="primary_government_id")


class RecordCompletion(BaseModel, table=True):
    """Record completion tracking for an employee's PDS."""

    __tablename__ = "record_completions"

    basic_information_id: str = Field(
        foreign_key="basic_information.id",
        unique=True,
        description="Reference to basic information (one-to-one)",
    )
    date_of_accomplishment: date = Field(description="Date the PDS was accomplished/completed")

    # Relationships
    basic_information: "BasicInformation" = Relationship(back_populates="record_completion")
