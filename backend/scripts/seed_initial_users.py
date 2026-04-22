"""Seed one initial account per role from .env.local.

This script is idempotent:
- If a username/email already exists, it skips creating that user.
- It does not overwrite existing users.

Usage:
    cd backend
    source .venv/bin/activate
    python scripts/seed_initial_users.py
"""

from __future__ import annotations

import asyncio
import logging
from dataclasses import dataclass
import sys
from pathlib import Path


BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from sqlalchemy.ext.asyncio import AsyncSession  # noqa: E402

from core.config import get_settings  # noqa: E402
from core.database import AsyncSessionLocal  # noqa: E402
from schemas.users import UserCreate, UserRole  # noqa: E402
from services.users import UserService  # noqa: E402


LOGGER = logging.getLogger("seed_initial_users")


@dataclass(frozen=True)
class InitialUserSeed:
    surname: str
    first_name: str
    middle_name: str | None
    email: str
    username: str
    password: str
    role: UserRole


def _build_seed_users() -> list[InitialUserSeed]:
    settings = get_settings()

    return [
        InitialUserSeed(
            surname=settings.initial_admin_surname,
            first_name=settings.initial_admin_first_name,
            middle_name=None,
            email=settings.initial_admin_email,
            username=settings.initial_admin_username,
            password=settings.initial_admin_password,
            role=UserRole.admin,
        ),
        InitialUserSeed(
            surname=settings.initial_president_surname,
            first_name=settings.initial_president_first_name,
            middle_name=None,
            email=settings.initial_president_email,
            username=settings.initial_president_username,
            password=settings.initial_president_password,
            role=UserRole.president,
        ),
        InitialUserSeed(
            surname=settings.initial_hr_surname,
            first_name=settings.initial_hr_first_name,
            middle_name=None,
            email=settings.initial_hr_email,
            username=settings.initial_hr_username,
            password=settings.initial_hr_password,
            role=UserRole.hr,
        ),
        InitialUserSeed(
            surname=settings.initial_hr_assistant_surname,
            first_name=settings.initial_hr_assistant_first_name,
            middle_name=None,
            email=settings.initial_hr_assistant_email,
            username=settings.initial_hr_assistant_username,
            password=settings.initial_hr_assistant_password,
            role=UserRole.hr_assistant,
        ),
        InitialUserSeed(
            surname=settings.initial_employee_surname,
            first_name=settings.initial_employee_first_name,
            middle_name=None,
            email=settings.initial_employee_email,
            username=settings.initial_employee_username,
            password=settings.initial_employee_password,
            role=UserRole.employee,
        ),
    ]


async def _create_if_missing(session: AsyncSession, seed: InitialUserSeed) -> str:
    service = UserService(session)

    existing_username = await service.get_by_username(seed.username)
    if existing_username:
        return f"skip ({seed.role.value}): username '{seed.username}' already exists"

    existing_email = await service.get_by_email(seed.email)
    if existing_email:
        return f"skip ({seed.role.value}): email '{seed.email}' already exists"

    payload = UserCreate(
        surname=seed.surname,
        first_name=seed.first_name,
        middle_name=seed.middle_name,
        email=seed.email,
        phone_number=None,
        username=seed.username,
        password=seed.password,
        role=seed.role,
        user_no=None,
        employee_id=None,
    )
    created = await service.create_user(payload)
    return f"created ({created.role}): username='{created.username}', user_no='{created.user_no}'"


async def seed_initial_users() -> None:
    seeds = _build_seed_users()

    async with AsyncSessionLocal() as session:
        for seed in seeds:
            result = await _create_if_missing(session, seed)
            LOGGER.info(result)


def main() -> None:
    logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
    asyncio.run(seed_initial_users())


if __name__ == "__main__":
    main()
