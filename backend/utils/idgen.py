"""ID generation utilities.

Provides helper for creating randomized, human-readable user IDs like
`ADMIN-ABC123` or `EMP-1A2B3C`.
"""
from typing import Optional
import secrets
import string


DEFAULT_SUFFIX_LEN = 6
DEFAULT_ALPHABET = string.ascii_uppercase + string.digits

PREFIX_MAP = {
    "admin": "ADMIN",
    "president": "PRES",
    "hr": "HR",
    "hr-assistant": "HR-ASST",
    "employee": "EMP",
}


def generate_user_no(role: str, suffix_length: int = DEFAULT_SUFFIX_LEN, alphabet: Optional[str] = None) -> str:
    """Generate a randomized human-readable user number for the given role.

    Args:
        role: Role name (e.g. "admin", "hr-assistant", "employee").
        suffix_length: Number of random characters in the suffix.
        alphabet: Optional characters to use for the random suffix.

    Returns:
        A string in the form "PREFIX-XXXXXX" where PREFIX is derived from the role.
    """
    prefix = PREFIX_MAP.get(role, "EMP")
    if alphabet is None:
        alphabet = DEFAULT_ALPHABET

    suffix = "".join(secrets.choice(alphabet) for _ in range(suffix_length))
    return f"{prefix}-{suffix}"
