"""Base service that all services inherit from."""
from datetime import datetime
from typing import Any, Generic, Optional, Type, TypeVar

from sqlalchemy import and_, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import SQLModel

T = TypeVar("T", bound=SQLModel)


class BaseService(Generic[T]):
    """Base service with common CRUD operations for all services.
    
    All services should inherit from this class and set the model_class attribute.
    Provides:
    - get: Get a single record by ID
    - get_all: Get all non-deleted records
    - remove: Soft delete a record
    - restore: Restore a soft deleted record
    """

    def __init__(self, model_class: Type[T], session: AsyncSession):
        """Initialize the base service.
        
        Args:
            model_class: The SQLModel model class that this service manages.
            session: The async database session for queries.
        """
        self.model_class = model_class
        self.session = session

    async def get(self, id: str) -> Optional[T]:
        """Get a single record by ID.
        
        Retrieves an active (non-deleted) record by its ID.
        
        Args:
            id: The unique identifier of the record.
            
        Returns:
            The record if found and not deleted, None otherwise.
        """
        stmt = select(self.model_class).where(
            and_(
                self.model_class.id == id,
                self.model_class.is_deleted == False,
            )
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_all(self, skip: int = 0, limit: int = 100) -> list[T]:
        """Get all non-deleted records.
        
        Retrieves all active (non-deleted) records with pagination support.
        
        Args:
            skip: Number of records to skip (default: 0).
            limit: Maximum number of records to return (default: 100).
            
        Returns:
            A list of active records.
        """
        stmt = (
            select(self.model_class)
            .where(self.model_class.is_deleted == False)
            .offset(skip)
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def remove(self, id: str) -> bool:
        """Soft delete a record.
        
        Marks a record as deleted by setting is_deleted to True and
        updating the deleted_at timestamp without removing it from the database.
        
        Args:
            id: The unique identifier of the record to delete.
            
        Returns:
            True if the record was deleted, False if record not found.
        """
        record = await self.get(id)
        if not record:
            return False

        stmt = (
            update(self.model_class)
            .where(self.model_class.id == id)
            .values(
                is_deleted=True,
                deleted_at=datetime.utcnow(),
            )
        )
        await self.session.execute(stmt)
        await self.session.commit()
        return True

    async def restore(self, id: str) -> bool:
        """Restore a soft deleted record.
        
        Marks a deleted record as active by setting is_deleted to False and
        clearing the deleted_at timestamp.
        
        Args:
            id: The unique identifier of the deleted record to restore.
            
        Returns:
            True if the record was restored, False if record not found or not deleted.
        """
        stmt = select(self.model_class).where(self.model_class.id == id)
        result = await self.session.execute(stmt)
        record = result.scalar_one_or_none()

        if not record or not record.is_deleted:
            return False

        stmt = (
            update(self.model_class)
            .where(self.model_class.id == id)
            .values(
                is_deleted=False,
                deleted_at=None,
            )
        )
        await self.session.execute(stmt)
        await self.session.commit()
        return True
