"""User account model."""
from typing import Optional, TYPE_CHECKING
from enum import Enum

from sqlmodel import Field, Relationship

from sqlalchemy import Column
from sqlalchemy import Enum as SQLEnum

from models.base import BaseModel

if TYPE_CHECKING:
    from models.employees import Employee



class UserRole(str, Enum):
    """Available roles for system users."""

    admin = "admin"
    president = "president"
    hr = "hr"
    hr_assistant = "hr-assistant"
    employee = "employee"


class User(BaseModel, table=True):
    """User account model for authentication and authorization."""

    __tablename__ = "users"

    surname: str = Field(max_length=100, description="Surname/Last name")
    first_name: str = Field(max_length=100, description="First name")
    middle_name: Optional[str] = Field(default=None, max_length=100, description="Middle name")
    user_no: str = Field(default=None, unique=True, max_length=20, description="Human-readable user number")
    email: str = Field(max_length=255, unique=True, description="Email address")
    phone_number: Optional[str] = Field(default=None, max_length=20, description="Phone or mobile number")
    username: str = Field(unique=True, max_length=50, description="Username for login")
    password: str = Field(max_length=255, description="Hashed password")
    role: UserRole = Field(
        sa_column=Column(SQLEnum(UserRole, name="user_role")),
        default=UserRole.employee,
        description="User role",
    )
    employee_id: Optional[str] = Field(
        default=None, 
        foreign_key="employees.id", 
        unique=True, 
        description="Link to employee record"
    )

    # Relationships
    employee: Optional["Employee"] = Relationship(back_populates="user")

    @property
    def full_name(self) -> str:
        """Get the full name of the user."""
        middle = f" {self.middle_name} " if self.middle_name else " "
        return f"{self.first_name}{middle}{self.surname}"

