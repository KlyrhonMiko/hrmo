"""File handling utilities for certificate uploads."""

import logging
import mimetypes
import uuid
from pathlib import Path
from typing import Optional

from fastapi import UploadFile


LOGGER = logging.getLogger(__name__)


# Define upload directories.
BASE_UPLOAD_DIR = Path(__file__).parent.parent / "uploads"
CERTIFICATES_DIR = BASE_UPLOAD_DIR / "certificates"

# Create directories if they don't exist
CERTIFICATES_DIR.mkdir(parents=True, exist_ok=True)

# Allowed file extensions for certificates
ALLOWED_CERTIFICATE_EXTENSIONS = {
    ".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png", ".gif",
    ".xls", ".xlsx", ".txt", ".tif", ".tiff"
}

# Max file size: 50 MB
MAX_FILE_SIZE = 50 * 1024 * 1024


class FileUploadError(Exception):
    """Custom exception for file upload errors."""
    pass


def _normalize_relative_path(file_path: str) -> str:
    """Normalize DB file path into the local certificates path format."""
    normalized = file_path.strip().lstrip("/")
    if not normalized:
        raise FileUploadError("No file path available for this certificate")

    if normalized.startswith("http://") or normalized.startswith("https://"):
        raise FileUploadError("URL-based file paths are not supported in local storage mode")

    if normalized.startswith("certificates/"):
        return normalized

    return f"certificates/{normalized}"


def _delete_local_file(file_path: str) -> bool:
    """Delete file from local storage."""
    normalized = _normalize_relative_path(file_path)
    full_path = BASE_UPLOAD_DIR / normalized
    if full_path.exists():
        full_path.unlink()
        return True
    return False


def _download_from_local(file_path: str) -> tuple[bytes, str]:
    """Download a file from local storage."""
    normalized = _normalize_relative_path(file_path)
    full_path = BASE_UPLOAD_DIR / normalized
    if not full_path.exists() or not full_path.is_file():
        raise FileUploadError("Local file not found")

    content = full_path.read_bytes()
    content_type = mimetypes.guess_type(str(full_path))[0] or "application/octet-stream"
    return content, content_type


async def save_certificate_file(
    file: UploadFile,
    employee_no: str,
) -> str:
    """Save uploaded certificate file to local disk.
    
    Args:
        file: The uploaded file from FastAPI
        employee_no: Employee number for organizing files
        
    Returns:
        str: Relative file path for storage in database
        
    Raises:
        FileUploadError: If file validation or saving fails
    """
    # Validate file extension
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ALLOWED_CERTIFICATE_EXTENSIONS:
        raise FileUploadError(
            f"File type '{file_ext}' not allowed. "
            f"Allowed types: {', '.join(ALLOWED_CERTIFICATE_EXTENSIONS)}"
        )
    
    # Validate file size
    file_content = await file.read()
    file_size = len(file_content)
    
    if file_size > MAX_FILE_SIZE:
        raise FileUploadError(
            f"File size {file_size / (1024*1024):.2f} MB exceeds maximum of "
            f"{MAX_FILE_SIZE / (1024*1024):.0f} MB"
        )
    
    if file_size == 0:
        raise FileUploadError("File is empty")
    
    # Generate unique filename to prevent collisions
    unique_id = str(uuid.uuid4())[:8]
    original_name = Path(file.filename).stem
    file_name = f"{unique_id}_{original_name}{file_ext}"

    # Keep DB path format stable for existing consumers.
    relative_path = f"certificates/{employee_no}/{file_name}"

    employee_dir = CERTIFICATES_DIR / employee_no
    employee_dir.mkdir(parents=True, exist_ok=True)
    file_path = employee_dir / file_name
    with open(file_path, "wb") as handle:
        handle.write(file_content)

    return relative_path


async def delete_certificate_file(file_path: Optional[str]) -> bool:
    """Delete certificate file from local disk.
    
    Args:
        file_path: Relative file path from database
        
    Returns:
        bool: True if file was deleted, False if file didn't exist
    """
    if not file_path:
        return False

    try:
        deleted_local = _delete_local_file(file_path)
        return deleted_local
    except Exception as e:
        raise FileUploadError(f"Error deleting file: {str(e)}")


def get_certificate_file_url(file_path: Optional[str]) -> Optional[str]:
    """Resolve a database file path to a URL clients can open."""
    if not file_path:
        return None

    normalized = _normalize_relative_path(file_path)
    return f"/uploads/{normalized}"


def get_certificate_file_path(file_path: Optional[str]) -> Optional[str]:
    """Get full filesystem path for a certificate file.
    
    Args:
        file_path: Relative file path from database
        
    Returns:
        str: Full filesystem path, or None if file_path is None
    """
    if not file_path:
        return None

    normalized = _normalize_relative_path(file_path)
    return str(BASE_UPLOAD_DIR / normalized)


async def download_certificate_file(file_path: Optional[str]) -> tuple[bytes, str, str]:
    """Download a certificate file from local storage.

    Returns:
        tuple[bytes, str, str]: (file content, content type, file name)
    """
    if not file_path:
        raise FileUploadError("No file path available for this certificate")

    normalized = _normalize_relative_path(file_path)
    filename = Path(normalized).name or "certificate-file"
    content, content_type = _download_from_local(normalized)
    return content, content_type, filename
