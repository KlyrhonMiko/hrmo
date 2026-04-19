"""Authentication-related Pydantic schemas."""
from __future__ import annotations

from typing import Any, Dict

from pydantic import BaseModel, Field


class AuthLogin(BaseModel):
    username_or_email: str = Field(...)
    password: str = Field(...)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: Dict[str, Any]
