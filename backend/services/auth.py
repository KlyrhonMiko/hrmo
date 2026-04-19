"""Authentication service wrapping user authentication and token creation."""
from typing import Any, Dict, Optional

from sqlalchemy.ext.asyncio import AsyncSession

from core.config import get_settings
from services.users import UserService
from utils.token import create_access_token


class AuthService:
    """Service for authentication-related operations.

    This delegates user lookups and password checks to `UserService` and
    centralizes JWT creation.
    """

    def __init__(self, session: AsyncSession):
        self.session = session
        self._user_service = UserService(session)
        self.settings = get_settings()

    async def authenticate(self, username_or_email: str, password: str) -> Optional[Any]:
        return await self._user_service.authenticate(username_or_email, password)

    def create_token_for_user(self, user: Any) -> Dict[str, Any]:
        payload = {"user_no": user.user_no, "role": user.role}
        token = create_access_token(data=payload, subject=user.id)
        return {
            "access_token": token,
            "token_type": "bearer",
            "expires_in": int(self.settings.access_token_expire_minutes),
        }
