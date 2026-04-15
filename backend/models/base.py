"""Base model that all tables inherit from."""
from datetime import datetime
from typing import Optional

from sqlmodel import SQLModel, Field
from uuid6 import uuid7


class BaseModel(SQLModel, table=False):
    """Base model with common fields for all tables.
    
    All tables should inherit from this model to have:
    - id: UUID v7 primary key
    - created_at: Timestamp of record creation
    - updated_at: Timestamp of last update
    - deleted_at: Timestamp of soft deletion (null if not deleted)
    - is_deleted: Boolean flag indicating if record is soft deleted
    """

    id: str = Field(
        default_factory=lambda: str(uuid7()),
        primary_key=True,
        description="UUID v7 primary key",
    )

    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="Timestamp of record creation",
    )

    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="Timestamp of last update",
    )

    deleted_at: Optional[datetime] = Field(
        default=None,
        description="Timestamp of soft deletion",
    )

    is_deleted: bool = Field(
        default=False,
        description="Boolean flag indicating if record is soft deleted",
    )
