"""JWT token helpers."""
from datetime import datetime, timedelta
from typing import Any, Dict, Optional

import jwt

from core.config import get_settings


def create_access_token(data: Dict[str, Any], subject: str, expires_minutes: Optional[int] = None) -> str:
    """Create a JWT access token containing `data` and subject `sub`.

    Args:
        data: Additional claims to include in the token payload.
        subject: The subject (usually user id) to set as `sub` claim.
        expires_minutes: Token expiry in minutes. If omitted uses settings.access_token_expire_minutes.

    Returns:
        Encoded JWT as string.
    """
    settings = get_settings()
    to_encode = dict(data or {})
    to_encode.update({"sub": subject})
    expire = datetime.utcnow() + timedelta(minutes=(expires_minutes or settings.access_token_expire_minutes))
    to_encode.update({"exp": expire})
    encoded = jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)
    return encoded


def decode_token(token: str) -> Dict[str, Any]:
    """Decode and validate a JWT token.

    Raises jwt.PyJWTError on invalid/expired tokens.
    """
    settings = get_settings()
    return jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
