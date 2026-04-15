"""Database configuration and session management."""
from typing import AsyncGenerator

from sqlalchemy import create_engine
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import sessionmaker

from core.config import get_settings

settings = get_settings()

# Create async engine for FastAPI async operations
engine = create_async_engine(
    settings.async_database_url,
    echo=settings.database_echo,
    future=True,
    pool_size=settings.database_pool_size,
    max_overflow=settings.database_max_overflow,
    pool_pre_ping=settings.database_pool_pre_ping,
)

# Async session factory for dependency injection
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    future=True,
)

# Synchronous engine (for Alembic migrations only)
sync_engine = create_engine(
    settings.database_url,
    echo=settings.database_echo,
    pool_size=settings.database_pool_size,
    max_overflow=settings.database_max_overflow,
    pool_pre_ping=settings.database_pool_pre_ping,
)

# Synchronous session factory (for Alembic)
SyncSessionLocal = sessionmaker(
    bind=sync_engine,
    expire_on_commit=False,
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Get database session for dependency injection.
    
    Yields:
        AsyncSession: SQLAlchemy async session instance.
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


async def init_db() -> None:
    """Initialize database tables.
    
    Creates all tables defined in SQLModel models.
    Note: With SQLModel, tables are created via Alembic migrations in production.
    This is mainly for development/testing.
    """
    from models.base import BaseModel
    
    async with engine.begin() as conn:
        # Create all tables from SQLModel models
        await conn.run_sync(BaseModel.metadata.create_all)


async def close_db() -> None:
    """Close database connections and cleanup."""
    await engine.dispose()


def get_sync_db():
    """Get synchronous database session for Alembic or blocking operations.
    
    Yields:
        Session: SQLAlchemy synchronous session instance.
    """
    db = SyncSessionLocal()
    try:
        yield db
    finally:
        db.close()
