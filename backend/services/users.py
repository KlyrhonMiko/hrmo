"""Services for user account management."""
from typing import Optional

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession

from models.users import User
from services.base import BaseService
from utils.security import hash_password
from schemas.users import UserCreate
from utils.idgen import generate_user_no
from utils.security import verify_password
from models.personal_information import BasicInformation



class UserService(BaseService[User]):
    """Service for managing `User` records."""

    def __init__(self, session: AsyncSession):
        super().__init__(User, session)

    async def get_by_user_no(self, user_no: str) -> Optional[User]:
        stmt = select(User).where(
            and_(User.user_no == user_no, User.is_deleted.is_(False))
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def _generate_unique_user_no(self, role: str) -> str:
        """Generate a unique human-readable user_no for the given role.

        Uses `utils.idgen.generate_user_no` to create randomized candidates and
        checks the database for uniqueness.
        """
        for _ in range(1000):
            candidate = generate_user_no(role)
            exists = await self.get_by_user_no(candidate)
            if not exists:
                return candidate

        raise RuntimeError("Failed to generate unique user_no")

    async def get_by_username(self, username: str) -> Optional[User]:
        stmt = select(User).where(
            and_(User.username == username, User.is_deleted.is_(False))
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def authenticate(self, username_or_email: str, password: str) -> Optional[User]:
        """Authenticate a user by username or email and verify password."""
        user = await self.get_by_username(username_or_email)
        if not user:
            user = await self.get_by_email(username_or_email)
        if not user:
            return None

        if not verify_password(password, user.password):
            return None

        return user

    async def get_by_email(self, email: str) -> Optional[User]:
        stmt = select(User).where(
            and_(User.email == email, User.is_deleted.is_(False))
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def create_user(self, user_in: UserCreate) -> User:
        """Create a new user, hashing the password before persisting."""
        hashed = hash_password(user_in.password)
        user_no = await self._generate_unique_user_no(user_in.role)
        record = User(
            user_no=user_no,
            surname=user_in.surname.strip(),
            first_name=user_in.first_name.strip(),
            middle_name=(user_in.middle_name.strip() if user_in.middle_name else None),
            email=user_in.email.lower().strip(),
            phone_number=(user_in.phone_number.strip() if user_in.phone_number else None),
            username=user_in.username.strip(),
            password=hashed,
            role=user_in.role,
        )

        self.session.add(record)
        await self.session.commit()
        await self.session.refresh(record)
        return record

    async def get_by_employee_id(self, employee_id: str) -> Optional[User]:
        """Get a user by their linked employee ID."""
        stmt = select(User).where(
            and_(User.employee_id == employee_id, User.is_deleted.is_(False))
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def sync_profile_from_pds(self, user: User, basic_info: BasicInformation) -> User:
        """Synchronize user name fields from PDS (BasicInformation)."""
        user.surname = basic_info.surname.strip()
        user.first_name = basic_info.first_name.strip()
        user.middle_name = basic_info.middle_name.strip() if basic_info.middle_name else None
        
        self.session.add(user)
        # Note: caller is responsible for committing if part of a larger transaction
        return user
