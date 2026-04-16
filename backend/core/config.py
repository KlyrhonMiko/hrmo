"""Application configuration management."""
from functools import lru_cache
from pathlib import Path
from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict


BASE_DIR = Path(__file__).resolve().parents[1]
PROJECT_ROOT = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=(
            str(PROJECT_ROOT / ".env.local"),
            str(PROJECT_ROOT / ".env"),
            str(BASE_DIR / ".env.local"),
            str(BASE_DIR / ".env"),
        ),
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Application
    app_name: str = "HRMO"
    app_version: str = "1.0.0"
    env: Literal["development", "staging", "production"] = "development"

    # Server
    host: str = "0.0.0.0"
    port: int = 5000
    reload: bool = True

    # Database (sync PostgreSQL URL - will be converted to async)
    database_url: str = "postgresql://user:password@localhost/hrmo"
    database_echo: bool = False
    database_pool_size: int = 4
    database_max_overflow: int = 0
    database_pool_pre_ping: bool = True

    # Supabase
    supabase_url: str | None = None
    supabase_key: str | None = None
    supabase_service_role_key: str | None = None
    supabase_storage_bucket: str = "certificates"

    # Security
    secret_key: str = "your-super-secret-key-change-this-in-production-12345678"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    @property
    def async_database_url(self) -> str:
        """Get async database URL for SQLAlchemy async engine.
        
        Returns:
            str: Async PostgreSQL connection string using asyncpg driver.
        """
        if self.database_url.startswith("postgresql://"):
            return self.database_url.replace("postgresql://", "postgresql+asyncpg://")
        if self.database_url.startswith("postgresql+asyncpg://"):
            return self.database_url
        raise ValueError(f"Invalid database URL format: {self.database_url}")


@lru_cache()
def get_settings() -> Settings:
    """Get cached application settings.
    
    Returns:
        Settings: Application configuration instance.
    """
    return Settings()
