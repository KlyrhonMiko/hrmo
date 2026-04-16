"""Upload existing local certificate files to Supabase Storage.

Usage examples:
    python backend/scripts/upload_certificate_files_to_supabase.py
    python backend/scripts/upload_certificate_files_to_supabase.py --dry-run
    python backend/scripts/upload_certificate_files_to_supabase.py --overwrite

Environment variables required:
    SUPABASE_URL
    SUPABASE_SERVICE_ROLE_KEY
Optional:
    SUPABASE_STORAGE_BUCKET (default: certificates)
"""

from __future__ import annotations

import argparse
import logging
import mimetypes
import os
from pathlib import Path
from urllib.parse import quote

import requests
from dotenv import load_dotenv


LOGGER = logging.getLogger("upload_certificate_files_to_supabase")
PROJECT_ROOT = Path(__file__).resolve().parents[1]


def load_env() -> None:
    """Load env files to resolve Supabase credentials."""
    load_dotenv(PROJECT_ROOT / ".env.local")
    load_dotenv(PROJECT_ROOT / ".env")


def parse_args() -> argparse.Namespace:
    """Parse command-line arguments."""
    parser = argparse.ArgumentParser(description="Upload local certificate files to Supabase Storage")
    parser.add_argument(
        "--source-dir",
        default="uploads/certificates",
        help="Local certificates directory to upload",
    )
    parser.add_argument(
        "--timeout",
        type=int,
        default=60,
        help="Upload request timeout in seconds",
    )
    parser.add_argument(
        "--overwrite",
        action="store_true",
        help="Overwrite objects that already exist in the Supabase bucket",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print what would be uploaded without making network calls",
    )
    return parser.parse_args()


def upload_object(
    session: requests.Session,
    supabase_url: str,
    service_role_key: str,
    bucket: str,
    source_file: Path,
    object_path: str,
    timeout_seconds: int,
    overwrite: bool,
) -> tuple[bool, str]:
    """Upload one file to Supabase Storage.

    Returns:
        tuple[bool, str]: (success, message)
    """
    upload_url = (
        f"{supabase_url.rstrip('/')}/storage/v1/object/"
        f"{bucket}/{quote(object_path, safe='/')}"
    )
    content_type = mimetypes.guess_type(str(source_file))[0] or "application/octet-stream"

    headers = {
        "Authorization": f"Bearer {service_role_key}",
        "apikey": service_role_key,
        "x-upsert": "true" if overwrite else "false",
        "Content-Type": content_type,
    }

    with source_file.open("rb") as handle:
        response = session.post(upload_url, headers=headers, data=handle.read(), timeout=timeout_seconds)

    if response.status_code in (200, 201):
        return True, "uploaded"

    if response.status_code == 409 and not overwrite:
        return True, "already-exists"

    return False, f"status={response.status_code} body={response.text[:300]}"


def main() -> int:
    """Run upload job."""
    args = parse_args()

    load_env()

    supabase_url = os.getenv("SUPABASE_URL", "").strip()
    service_role_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "").strip()
    bucket_name = os.getenv("SUPABASE_STORAGE_BUCKET", "certificates").strip() or "certificates"

    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s | %(levelname)s | %(message)s",
    )

    if not supabase_url:
        LOGGER.error("Missing SUPABASE_URL")
        return 1
    if not service_role_key:
        LOGGER.error("Missing SUPABASE_SERVICE_ROLE_KEY")
        return 1

    source_dir = Path(args.source_dir).resolve()
    if not source_dir.exists() or not source_dir.is_dir():
        LOGGER.error("Source directory does not exist or is not a directory: %s", source_dir)
        return 1

    files = sorted(path for path in source_dir.rglob("*") if path.is_file())
    if not files:
        LOGGER.warning("No files found in %s", source_dir)
        return 0

    LOGGER.info("Bucket: %s", bucket_name)
    LOGGER.info("Source: %s", source_dir)
    LOGGER.info("Files discovered: %s", len(files))

    uploaded_count = 0
    failed_count = 0
    skipped_count = 0

    with requests.Session() as session:
        for source_file in files:
            object_path = source_file.relative_to(source_dir).as_posix()

            if args.dry_run:
                LOGGER.info("[DRY-RUN] %s -> %s", source_file, object_path)
                skipped_count += 1
                continue

            success, message = upload_object(
                session=session,
                supabase_url=supabase_url,
                service_role_key=service_role_key,
                bucket=bucket_name,
                source_file=source_file,
                object_path=object_path,
                timeout_seconds=args.timeout,
                overwrite=args.overwrite,
            )

            if success:
                if message == "already-exists":
                    skipped_count += 1
                else:
                    uploaded_count += 1
                LOGGER.info("%s | %s", message, object_path)
            else:
                failed_count += 1
                LOGGER.error("failed | %s | %s", object_path, message)

    LOGGER.info(
        "Done | uploaded=%s skipped=%s failed=%s total=%s",
        uploaded_count,
        skipped_count,
        failed_count,
        len(files),
    )

    return 1 if failed_count else 0


if __name__ == "__main__":
    raise SystemExit(main())
