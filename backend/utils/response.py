"""Utilities for response handling and error wrapping."""
from datetime import datetime
from math import ceil
from typing import Any, Optional

from fastapi import Request
from pydantic import BaseModel


class APIResponse(BaseModel):
    """Standardized API response wrapper.
    
    Attributes:
        success: Whether the request was successful
        path: The API path that was called
        data: The response data payload, or error details on failure
        timestamp: When the response was generated (ISO 8601 format)
    """

    success: bool
    path: str
    data: Optional[Any] = None
    meta: Optional[Any] = None
    timestamp: str  # ISO 8601 format


def create_response(
    path: str,
    data: Optional[Any] = None,
    meta: Optional[Any] = None,
    success: bool = True,
    timestamp: Optional[datetime] = None,
) -> APIResponse:
    """Create a standardized API response.
    
    Args:
        path: The API endpoint path
        data: The response payload or error details
        success: Whether the request was successful
        timestamp: When the response was generated (defaults to now)
    
    Returns:
        APIResponse: The standardized response object
    """
    if timestamp is None:
        timestamp = datetime.utcnow()
    
    return APIResponse(
        success=success,
        path=path,
        data=data,
        meta=meta,
        timestamp=timestamp.isoformat() + "Z",
    )


def build_pagination_meta(skip: int, limit: int, total_records: int) -> dict[str, Any]:
    """Build a consistent pagination metadata object for list responses."""
    safe_limit = max(limit, 1)
    safe_skip = max(skip, 0)
    safe_total = max(total_records, 0)
    current_page = (safe_skip // safe_limit) + 1
    total_pages = ceil(safe_total / safe_limit) if safe_total > 0 else 0

    return {
        "skip": safe_skip,
        "limit": safe_limit,
        "current_page": current_page,
        "total_pages": total_pages,
        "total_records": safe_total,
        "has_previous": safe_skip > 0,
        "has_next": safe_skip + safe_limit < safe_total,
    }


def wrap_response(request: Request, data: Optional[Any] = None) -> APIResponse:
    """Wrap a successful response with request context.
    
    Args:
        request: The FastAPI request object
        data: The response payload
    
    Returns:
        APIResponse: The standardized response object
    """
    return create_response(
        path=request.url.path,
        data=data,
        success=True,
    )


def wrap_error(
    request: Request,
    error_message: str,
    status_code: Optional[int] = None,
) -> APIResponse:
    """Wrap an error response with request context.
    
    Args:
        request: The FastAPI request object
        error_message: The error message to include
        status_code: Optional HTTP status code
    
    Returns:
        APIResponse: The standardized error response object
    """
    error_data = {
        "message": error_message,
    }
    if status_code:
        error_data["status_code"] = status_code
    
    return create_response(
        path=request.url.path,
        data=error_data,
        success=False,
    )
