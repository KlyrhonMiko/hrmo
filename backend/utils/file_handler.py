"""File handling utilities for certificate uploads."""

import logging
import mimetypes
import uuid
from pathlib import Path
from typing import Optional
from urllib.parse import quote, urlparse

import httpx
from fastapi import UploadFile

from core.config import get_settings


LOGGER = logging.getLogger(__name__)
settings = get_settings()


# Define upload directories for local fallback and backwards compatibility
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


def _is_supabase_storage_enabled() -> bool:
    """Return True when Supabase Storage credentials are configured."""
    return bool(
        settings.supabase_url
        and settings.supabase_service_role_key
        and settings.supabase_storage_bucket
    )


def _strip_bucket_prefix(path_value: str) -> str:
    """Normalize a DB file path or URL into a Storage object path."""
    normalized = path_value.strip()

    if normalized.startswith("http://") or normalized.startswith("https://"):
        parsed = urlparse(normalized)
        public_marker = f"/storage/v1/object/public/{settings.supabase_storage_bucket}/"
        signed_marker = f"/storage/v1/object/sign/{settings.supabase_storage_bucket}/"
        authenticated_marker = f"/storage/v1/object/authenticated/{settings.supabase_storage_bucket}/"
        object_marker = f"/storage/v1/object/{settings.supabase_storage_bucket}/"

        for marker in (public_marker, signed_marker, authenticated_marker, object_marker):
            if marker in parsed.path:
                return parsed.path.split(marker, maxsplit=1)[1].lstrip("/")

        return parsed.path.lstrip("/")

    normalized = normalized.lstrip("/")
    bucket_prefix = f"{settings.supabase_storage_bucket}/"
    if normalized.startswith(bucket_prefix):
        return normalized[len(bucket_prefix):]
    if normalized.startswith("certificates/"):
        return normalized[len("certificates/"):]
    return normalized


async def _upload_to_supabase(
    file_content: bytes,
    object_path: str,
    content_type: str,
) -> None:
    """Upload file bytes to Supabase Storage."""
    if not _is_supabase_storage_enabled():
        raise FileUploadError("Supabase Storage is not configured")

    upload_url = (
        f"{settings.supabase_url.rstrip('/')}/storage/v1/object/"
        f"{settings.supabase_storage_bucket}/{quote(object_path, safe='/')}"
    )
    headers = {
        "Authorization": f"Bearer {settings.supabase_service_role_key}",
        "apikey": settings.supabase_service_role_key,
        "x-upsert": "true",
        "Content-Type": content_type,
    }

    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(upload_url, headers=headers, content=file_content)

    if response.status_code not in (200, 201):
        raise FileUploadError(
            "Supabase upload failed "
            f"(status={response.status_code}): {response.text[:300]}"
        )


async def _delete_from_supabase(object_path: str) -> bool:
    """Delete a file from Supabase Storage."""
    if not _is_supabase_storage_enabled():
        return False

    delete_url = (
        f"{settings.supabase_url.rstrip('/')}/storage/v1/object/"
        f"{settings.supabase_storage_bucket}/{quote(object_path, safe='/')}"
    )
    headers = {
        "Authorization": f"Bearer {settings.supabase_service_role_key}",
        "apikey": settings.supabase_service_role_key,
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.delete(delete_url, headers=headers)

    if response.status_code in (200, 204):
        return True
    if response.status_code == 404:
        return False

    raise FileUploadError(
        "Supabase delete failed "
        f"(status={response.status_code}): {response.text[:300]}"
    )


def _delete_local_file(file_path: str) -> bool:
    """Delete file from local fallback storage."""
    normalized = file_path.strip()
    if normalized.startswith("http://") or normalized.startswith("https://"):
        return False

    full_path = BASE_UPLOAD_DIR / normalized.lstrip("/")
    if full_path.exists():
        full_path.unlink()
        return True
    return False


async def _download_from_supabase(object_path: str) -> tuple[bytes, str]:
    """Download a file from Supabase Storage.

    Returns:
        tuple[bytes, str]: (file content, content type)
    """
    if not _is_supabase_storage_enabled():
        raise FileUploadError("Supabase Storage is not configured")

    download_url = (
        f"{settings.supabase_url.rstrip('/')}/storage/v1/object/"
        f"{settings.supabase_storage_bucket}/{quote(object_path, safe='/')}"
    )
    headers = {
        "Authorization": f"Bearer {settings.supabase_service_role_key}",
        "apikey": settings.supabase_service_role_key,
    }

    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.get(download_url, headers=headers)

    if response.status_code == 404:
        raise FileUploadError("File not found in Supabase Storage")
    if response.status_code != 200:
        raise FileUploadError(
            "Supabase download failed "
            f"(status={response.status_code}): {response.text[:300]}"
        )

    content_type = response.headers.get("content-type") or mimetypes.guess_type(object_path)[0] or "application/octet-stream"
    return response.content, content_type


def _download_from_local(file_path: str) -> tuple[bytes, str]:
    """Download a file from local fallback storage."""
    full_path = BASE_UPLOAD_DIR / file_path.lstrip("/")
    if not full_path.exists() or not full_path.is_file():
        raise FileUploadError("Local file not found")

    content = full_path.read_bytes()
    content_type = mimetypes.guess_type(str(full_path))[0] or "application/octet-stream"
    return content, content_type


async def save_certificate_file(
    file: UploadFile,
    employee_no: str,
) -> str:
    """Save uploaded certificate file to disk.
    
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

    if _is_supabase_storage_enabled():
        object_path = _strip_bucket_prefix(relative_path)
        content_type = file.content_type or mimetypes.guess_type(file.filename)[0] or "application/octet-stream"
        await _upload_to_supabase(
            file_content=file_content,
            object_path=object_path,
            content_type=content_type,
        )
        return relative_path

    # Local disk fallback when Supabase is not configured.
    employee_dir = CERTIFICATES_DIR / employee_no
    employee_dir.mkdir(parents=True, exist_ok=True)
    file_path = employee_dir / file_name
    with open(file_path, "wb") as handle:
        handle.write(file_content)

    return relative_path


async def delete_certificate_file(file_path: Optional[str]) -> bool:
    """Delete certificate file from disk.
    
    Args:
        file_path: Relative file path from database
        
    Returns:
        bool: True if file was deleted, False if file didn't exist
    """
    if not file_path:
        return False

    try:
        deleted_supabase = False
        if _is_supabase_storage_enabled():
            object_path = _strip_bucket_prefix(file_path)
            deleted_supabase = await _delete_from_supabase(object_path)

        deleted_local = _delete_local_file(file_path)
        return deleted_supabase or deleted_local
    except Exception as e:
        raise FileUploadError(f"Error deleting file: {str(e)}")


def get_certificate_file_url(file_path: Optional[str]) -> Optional[str]:
    """Resolve a database file path to a URL clients can open."""
    if not file_path:
        return None

    normalized = file_path.strip()
    if normalized.startswith("http://") or normalized.startswith("https://"):
        return normalized

    normalized = normalized.lstrip("/")

    if _is_supabase_storage_enabled():
        object_path = _strip_bucket_prefix(normalized)
        return (
            f"{settings.supabase_url.rstrip('/')}/storage/v1/object/public/"
            f"{settings.supabase_storage_bucket}/{quote(object_path, safe='/')}"
        )

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

    normalized = file_path.strip()
    if normalized.startswith("http://") or normalized.startswith("https://"):
        return None

    return str(BASE_UPLOAD_DIR / normalized.lstrip("/"))


async def download_certificate_file(file_path: Optional[str]) -> tuple[bytes, str, str]:
    """Download a certificate file from storage.

    Returns:
        tuple[bytes, str, str]: (file content, content type, file name)
    """
    if not file_path:
        raise FileUploadError("No file path available for this certificate")

    normalized = file_path.strip()
    if not normalized:
        raise FileUploadError("No file path available for this certificate")

    object_path = _strip_bucket_prefix(normalized)
    filename = Path(object_path).name or "certificate-file"

    if _is_supabase_storage_enabled():
        content, content_type = await _download_from_supabase(object_path)
        return content, content_type, filename

    if normalized.startswith("http://") or normalized.startswith("https://"):
        raise FileUploadError("Cannot download URL-based file when Supabase Storage is not configured")

    content, content_type = _download_from_local(normalized)
    return content, content_type, filename
