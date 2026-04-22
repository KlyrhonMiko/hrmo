"""Application configuration management."""
from functools import lru_cache
from pathlib import Path
from typing import Literal

from pydantic import ValidationError, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


BASE_DIR = Path(__file__).resolve().parents[1]
PROJECT_ROOT = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=str(PROJECT_ROOT / ".env.local"),
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Application
    app_name: str = "HRMO"
    app_version: str = "1.0.0"
    env: Literal["development", "staging", "production"]

    # Server
    host: str
    port: int
    reload: bool

    # Database (sync PostgreSQL URL - will be converted to async)
    database_url: str
    database_echo: bool
    database_pool_size: int
    database_max_overflow: int
    database_pool_pre_ping: bool

    # Security
    secret_key: str
    algorithm: str
    access_token_expire_minutes: int

    # Service URLs
    frontend_url: str
    backend_url: str
    docker_frontend_url: str
    docker_backend_url: str

    # Initial users (one per role)
    initial_admin_surname: str
    initial_admin_first_name: str
    initial_admin_email: str
    initial_admin_username: str
    initial_admin_password: str

    initial_president_surname: str
    initial_president_first_name: str
    initial_president_email: str
    initial_president_username: str
    initial_president_password: str

    initial_hr_surname: str
    initial_hr_first_name: str
    initial_hr_email: str
    initial_hr_username: str
    initial_hr_password: str

    initial_hr_assistant_surname: str
    initial_hr_assistant_first_name: str
    initial_hr_assistant_email: str
    initial_hr_assistant_username: str
    initial_hr_assistant_password: str

    initial_employee_surname: str
    initial_employee_first_name: str
    initial_employee_email: str
    initial_employee_username: str
    initial_employee_password: str

    @field_validator(
        "host",
        "database_url",
        "secret_key",
        "algorithm",
        "frontend_url",
        "backend_url",
        "docker_frontend_url",
        "docker_backend_url",
        "initial_admin_surname",
        "initial_admin_first_name",
        "initial_admin_email",
        "initial_admin_username",
        "initial_admin_password",
        "initial_president_surname",
        "initial_president_first_name",
        "initial_president_email",
        "initial_president_username",
        "initial_president_password",
        "initial_hr_surname",
        "initial_hr_first_name",
        "initial_hr_email",
        "initial_hr_username",
        "initial_hr_password",
        "initial_hr_assistant_surname",
        "initial_hr_assistant_first_name",
        "initial_hr_assistant_email",
        "initial_hr_assistant_username",
        "initial_hr_assistant_password",
        "initial_employee_surname",
        "initial_employee_first_name",
        "initial_employee_email",
        "initial_employee_username",
        "initial_employee_password",
        mode="before",
    )
    @classmethod
    def _validate_non_empty_strings(cls, value: str, info):
        if value is None:
            raise ValueError(f"{info.field_name.upper()} is required in .env.local")

        if not isinstance(value, str):
            return value

        cleaned = value.strip()
        if not cleaned:
            raise ValueError(f"{info.field_name.upper()} must not be empty in .env.local")

        return cleaned

    @field_validator("port")
    @classmethod
    def _validate_port(cls, value: int):
        if value <= 0 or value > 65535:
            raise ValueError("PORT must be between 1 and 65535 in .env.local")
        return value

    @field_validator("database_pool_size", "access_token_expire_minutes")
    @classmethod
    def _validate_positive_ints(cls, value: int, info):
        if value <= 0:
            raise ValueError(f"{info.field_name.upper()} must be greater than 0 in .env.local")
        return value

    @field_validator("database_max_overflow")
    @classmethod
    def _validate_max_overflow(cls, value: int):
        if value < 0:
            raise ValueError("DATABASE_MAX_OVERFLOW must be 0 or greater in .env.local")
        return value

    @field_validator("database_url")
    @classmethod
    def _validate_database_url(cls, value: str):
        if not value.startswith(("postgresql://", "postgresql+asyncpg://")):
            raise ValueError(
                "DATABASE_URL must start with postgresql:// or postgresql+asyncpg:// in .env.local"
            )
        return value

    @field_validator(
        "frontend_url",
        "backend_url",
        "docker_frontend_url",
        "docker_backend_url",
    )
    @classmethod
    def _validate_service_urls(cls, value: str, info):
        if not value.startswith(("http://", "https://")):
            raise ValueError(
                f"{info.field_name.upper()} must start with http:// or https:// in .env.local"
            )
        return value

    @field_validator(
        "initial_admin_email",
        "initial_president_email",
        "initial_hr_email",
        "initial_hr_assistant_email",
        "initial_employee_email",
    )
    @classmethod
    def _validate_initial_user_email(cls, value: str, info):
        if "@" not in value:
            raise ValueError(f"{info.field_name.upper()} must be a valid email in .env.local")
        return value.lower()

    @field_validator(
        "initial_admin_password",
        "initial_president_password",
        "initial_hr_password",
        "initial_hr_assistant_password",
        "initial_employee_password",
    )
    @classmethod
    def _validate_initial_user_password(cls, value: str, info):
        if len(value) < 8:
            raise ValueError(
                f"{info.field_name.upper()} must be at least 8 characters in .env.local"
            )
        return value

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
    # Optionally load from .env.local if it exists
    # Pydantic BaseSettings handles this through SettingsConfigDict
    try:
        return Settings()
    except ValidationError as exc:
        errors = "; ".join(
            f"{'.'.join(str(part) for part in err['loc'])}: {err['msg']}" for err in exc.errors()
        )
        raise RuntimeError(f"Invalid .env.local configuration: {errors}") from exc
