"""File handling utilities for document uploads."""
import os
import uuid
from pathlib import Path
from typing import Optional

from fastapi import UploadFile


# Define upload directories
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
    
    # Create employee-specific directory
    employee_dir = CERTIFICATES_DIR / employee_no
    employee_dir.mkdir(parents=True, exist_ok=True)
    
    # Generate unique filename to prevent collisions
    unique_id = str(uuid.uuid4())[:8]
    original_name = Path(file.filename).stem
    file_name = f"{unique_id}_{original_name}{file_ext}"
    file_path = employee_dir / file_name
    
    # Save file to disk
    with open(file_path, "wb") as f:
        f.write(file_content)
    
    # Return relative path for database storage
    relative_path = f"certificates/{employee_no}/{file_name}"
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
    
    full_path = BASE_UPLOAD_DIR / file_path
    
    try:
        if full_path.exists():
            full_path.unlink()
            return True
        return False
    except Exception as e:
        raise FileUploadError(f"Error deleting file: {str(e)}")


def get_certificate_file_path(file_path: Optional[str]) -> Optional[str]:
    """Get full filesystem path for a certificate file.
    
    Args:
        file_path: Relative file path from database
        
    Returns:
        str: Full filesystem path, or None if file_path is None
    """
    if not file_path:
        return None
    
    return str(BASE_UPLOAD_DIR / file_path)
