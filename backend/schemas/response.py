"""Generic API response wrapper schema."""
from datetime import datetime
from typing import Any, Generic, Optional, TypeVar

from pydantic import BaseModel, Field

T = TypeVar("T")


class GenericResponse(BaseModel, Generic[T]):
    """Generic response wrapper for all API endpoints.
    
    Attributes:
        success: Whether the request was successful.
        path: The API path that was called.
        data: The response data payload, or error details on failure.
        timestamp: When the response was generated.
    """

    success: bool = Field(..., description="Whether the request was successful")
    path: str = Field(..., description="The API path that was called")
    data: Optional[Any] = Field(None, description="Response data or error details")
    timestamp: datetime = Field(
        default_factory=datetime.utcnow,
        description="When the response was generated"
    )

    class Config:
        """Pydantic config."""
        json_schema_extra = {
            "example": {
                "success": True,
                "path": "/api/employees",
                "data": {"id": "123", "employee_no": "EMP001"},
                "timestamp": "2026-04-15T10:30:00"
            }
        }
