"""Schemas for user account registration and responses."""
from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


class UserRole(str, Enum):
    admin = "admin"
    president = "president"
    hr = "hr"
    hr_assistant = "hr-assistant"
    employee = "employee"


class UserBase(BaseModel):
    surname: str = Field(..., max_length=100)
    first_name: str = Field(..., max_length=100)
    middle_name: Optional[str] = Field(None, max_length=100)
    email: str = Field(..., max_length=255)
    phone_number: Optional[str] = Field(None, max_length=20)
    username: str = Field(..., max_length=50)
    role: UserRole = Field(default=UserRole.employee)
    user_no: Optional[str] = Field(None, max_length=20)
    employee_id: Optional[str] = Field(None, description="Optional link to employee group")



class UserCreate(UserBase):
    password: str = Field(..., min_length=8)


class UserLogin(BaseModel):
    username_or_email: str = Field(...)
    password: str = Field(...)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int


class UserResponse(UserBase):
    id: str
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None
    is_deleted: bool

    class Config:
        from_attributes = True
