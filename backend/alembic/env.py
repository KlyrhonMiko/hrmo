"""Alembic environment configuration."""
from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool
from sqlalchemy.engine import make_url
from alembic import context
import os
import sys
from pathlib import Path

# Add the backend directory to the path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

# Import configuration and database setup
from core.config import get_settings

# Import all models from the models package
# This ensures all table definitions are available for migration generation
# New models just need to be added to models/__init__.py
from models import BaseModel

# Get application settings
settings = get_settings()

# This is the Alembic Config object
config = context.config

# Interpret the config file for Python logging
if config.config_file_name is not None:
    try:
        fileConfig(config.config_file_name)
    except ValueError:
        # Fallback when logger keys are malformed; migrations can still proceed.
        pass

# Set the sqlalchemy.url from environment variable or settings.
# ALEMBIC_DATABASE_URL takes precedence for migration-only overrides.
raw_sqlalchemy_url = (
    os.getenv("ALEMBIC_DATABASE_URL")
    or os.getenv("DATABASE_URL")
    or settings.database_url
)
parsed_url = make_url(raw_sqlalchemy_url)

# Ensure remote PostgreSQL connections fail fast and use SSL by default.
if parsed_url.drivername.startswith("postgresql") and parsed_url.host not in {None, "localhost", "127.0.0.1"}:
    query = dict(parsed_url.query)
    query.setdefault("sslmode", "require")
    query.setdefault("connect_timeout", "10")
    parsed_url = parsed_url.set(query=query)

sqlalchemy_url = parsed_url.render_as_string(hide_password=False)
config.set_main_option("sqlalchemy.url", sqlalchemy_url)

# Use BaseModel metadata for autogenerate support
# This includes all models that inherit from BaseModel
target_metadata = BaseModel.metadata


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode.

    This configures the context with just a URL without an Engine.
    Calls to context.execute() here emit the given string to the script output.
    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode.

    In this scenario we create an Engine and associate a connection with the context.
    """
    configuration = config.get_section(config.config_ini_section) or {}
    configuration["sqlalchemy.url"] = sqlalchemy_url
    
    connectable = engine_from_config(
        configuration,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
            compare_server_default=True,
        )

        with context.begin_transaction():
            context.run_migrations()


# Determine whether to run migrations offline or online
if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
