"""Seed certificate records through API endpoints.

Usage examples:
    python backend/scripts/seed_certificates.py
    python backend/scripts/seed_certificates.py --count 60 --seed 42
    python backend/scripts/seed_certificates.py --base-url http://127.0.0.1:8000

By default this script:
- Pulls existing employees from: /api/employees
- Creates certificate entries through: /api/certificates/{employee_no}
- Does not upload files unless --with-files is provided
"""

from __future__ import annotations

import argparse
import logging
import random
import time
from dataclasses import dataclass
from datetime import date, timedelta
from typing import Any

import requests


LOGGER = logging.getLogger("seed_certificates_api")

CERTIFICATE_TYPES = [
    "National Certificate II",
    "National Certificate III",
    "PRC License",
    "Data Privacy Certification",
    "Public Financial Management Training Certificate",
    "Leadership Development Certificate",
    "ISO 9001 Internal Auditor",
    "Records Management Certification",
    "BOSH Safety Training Certificate",
    "Trainers Methodology Certificate",
]

ISSUING_BODIES = [
    "TESDA",
    "Civil Service Commission",
    "Professional Regulation Commission",
    "Department of Labor and Employment",
    "Department of Information and Communications Technology",
    "Commission on Higher Education",
    "National Economic and Development Authority",
    "Development Academy of the Philippines",
    "Local Government Academy",
]

CERTIFICATE_DESCRIPTIONS = [
    "Credential relevant to current role requirements.",
    "Completed competency program with satisfactory assessment.",
    "Certificate issued after attendance and passing evaluation.",
    "Credential used for professional advancement.",
    "Required supporting document for compliance monitoring.",
    "Specialized qualification aligned with service delivery standards.",
]

VERIFIERS = [
    "HRMO Officer",
    "HRMO Supervisor",
    "Records Verifier",
    "Admin Officer",
    "Training Coordinator",
]


@dataclass(frozen=True)
class SeedResult:
    """Result details for one certificate insert call."""

    employee_no: str
    certificate_no: str
    success: bool
    http_status: int
    message: str


def parse_args() -> argparse.Namespace:
    """Parse command-line arguments."""
    parser = argparse.ArgumentParser(description="Seed certificate entries via API")
    parser.add_argument("--base-url", default="http://127.0.0.1:8000", help="API base URL")
    parser.add_argument(
        "--employee-endpoint",
        default="/api/employees",
        help="Employee listing endpoint path",
    )
    parser.add_argument(
        "--endpoint",
        default="/api/certificates",
        help="Certificate endpoint prefix (records are posted to /{employee_no})",
    )
    parser.add_argument("--count", type=int, default=40, help="Number of certificates to create")
    parser.add_argument("--timeout", type=int, default=25, help="Request timeout in seconds")
    parser.add_argument("--pause-ms", type=int, default=100, help="Pause between requests in milliseconds")
    parser.add_argument("--seed", type=int, default=None, help="Optional random seed for reproducibility")
    parser.add_argument(
        "--with-files",
        action="store_true",
        help="Attach generated in-memory text files to some certificate requests",
    )
    parser.add_argument(
        "--employee-page-size",
        type=int,
        default=200,
        help="Page size when fetching employees",
    )
    return parser.parse_args()


def _fmt(value: date) -> str:
    """Format date as ISO date string."""
    return value.isoformat()


def _digits(rng: random.Random, length: int) -> str:
    """Generate a numeric string with a fixed length."""
    return "".join(str(rng.randint(0, 9)) for _ in range(length))


def _random_date(rng: random.Random, start_year: int, end_year: int) -> date:
    """Return a random date between Jan 1 of start_year and Dec 31 of end_year."""
    start = date(start_year, 1, 1)
    end = date(end_year, 12, 31)
    delta_days = max((end - start).days, 1)
    return start + timedelta(days=rng.randint(0, delta_days))


def _extract_message(body: Any) -> str:
    """Extract a human-readable message from an API response body."""
    if not isinstance(body, dict):
        return "No JSON body"

    if body.get("message"):
        return str(body.get("message"))

    data = body.get("data")
    if isinstance(data, dict):
        if data.get("message"):
            return str(data.get("message"))
        if data.get("status_code"):
            return f"status_code={data.get('status_code')}"

    return "No message"


def _fetch_employee_numbers(
    session: requests.Session,
    base_url: str,
    employee_endpoint: str,
    timeout_seconds: int,
    page_size: int,
) -> list[str]:
    """Fetch employee numbers from the employees listing endpoint."""
    normalized_base = base_url.rstrip("/")
    normalized_endpoint = employee_endpoint if employee_endpoint.startswith("/") else f"/{employee_endpoint}"
    target_url = f"{normalized_base}{normalized_endpoint}"

    skip = 0
    seen: set[str] = set()
    employee_numbers: list[str] = []

    for _ in range(200):
        response = session.get(
            target_url,
            params={"skip": skip, "limit": page_size},
            timeout=timeout_seconds,
        )
        response.raise_for_status()

        body: Any = response.json()
        data = body.get("data") if isinstance(body, dict) else None
        meta = body.get("meta") if isinstance(body, dict) else None

        if not isinstance(data, list) or not data:
            break

        page_count = 0
        for entry in data:
            if not isinstance(entry, dict):
                continue
            employee_no = entry.get("employee_no") or entry.get("employeeNo")
            if isinstance(employee_no, str) and employee_no and employee_no not in seen:
                seen.add(employee_no)
                employee_numbers.append(employee_no)
                page_count += 1

        if page_count == 0:
            break

        has_next = bool(meta.get("has_next")) if isinstance(meta, dict) else len(data) >= page_size
        if not has_next:
            break

        skip += page_size

    return employee_numbers


def _build_payload(
    index: int,
    batch_tag: int,
    employee_no: str,
    rng: random.Random,
    with_files: bool,
) -> tuple[dict[str, str], str, dict[str, tuple[str, bytes, str]] | None]:
    """Build one certificate payload for an employee."""
    certificate_type = rng.choice(CERTIFICATE_TYPES)
    issued = _random_date(rng, 2016, date.today().year)

    has_expiry = rng.random() < 0.6
    expiry_date = issued + timedelta(days=rng.randint(365, 365 * 5)) if has_expiry else None
    cert_no = f"CERT-{batch_tag}-{index:04d}-{_digits(rng, 3)}"

    data: dict[str, str] = {
        "certificate_type": certificate_type,
        "issuing_body": rng.choice(ISSUING_BODIES),
        "certificate_no": cert_no,
        "date_issued": _fmt(issued),
        "description": rng.choice(CERTIFICATE_DESCRIPTIONS),
    }

    if expiry_date is not None:
        data["expiry_date"] = _fmt(expiry_date)

    if rng.random() < 0.5:
        data["verified_by"] = rng.choice(VERIFIERS)

    files: dict[str, tuple[str, bytes, str]] | None = None
    if with_files and rng.random() < 0.45:
        file_content = (
            f"Employee: {employee_no}\n"
            f"Certificate No: {cert_no}\n"
            f"Certificate Type: {certificate_type}\n"
            f"Issued: {_fmt(issued)}\n"
        ).encode("utf-8")
        filename = f"{employee_no.lower()}_{index:04d}.txt"
        files = {"file": (filename, file_content, "text/plain")}

    return data, cert_no, files


def _post_certificate(
    session: requests.Session,
    target_url: str,
    payload: dict[str, str],
    files: dict[str, tuple[str, bytes, str]] | None,
    timeout_seconds: int,
    employee_no: str,
    certificate_no: str,
) -> SeedResult:
    """POST one certificate payload and return normalized result."""
    try:
        response = session.post(target_url, data=payload, files=files, timeout=timeout_seconds)
        try:
            response_body: Any = response.json()
        except ValueError:
            response_body = None

        ok = response.ok and isinstance(response_body, dict) and bool(response_body.get("success", True))
        return SeedResult(
            employee_no=employee_no,
            certificate_no=certificate_no,
            success=ok,
            http_status=response.status_code,
            message=_extract_message(response_body),
        )
    except requests.RequestException as exc:
        return SeedResult(
            employee_no=employee_no,
            certificate_no=certificate_no,
            success=False,
            http_status=0,
            message=f"Request failed: {exc}",
        )


def seed_data(
    base_url: str,
    employee_endpoint: str,
    endpoint_prefix: str,
    count: int,
    timeout_seconds: int,
    pause_ms: int,
    with_files: bool,
    page_size: int,
    rng: random.Random,
) -> list[SeedResult]:
    """Insert multiple certificate entries using API endpoints."""
    normalized_base = base_url.rstrip("/")
    normalized_prefix = endpoint_prefix if endpoint_prefix.startswith("/") else f"/{endpoint_prefix}"

    session = requests.Session()
    employee_numbers = _fetch_employee_numbers(
        session=session,
        base_url=normalized_base,
        employee_endpoint=employee_endpoint,
        timeout_seconds=timeout_seconds,
        page_size=page_size,
    )

    if not employee_numbers:
        raise ValueError("No employees found. Seed employee records first.")

    LOGGER.info("Fetched %d employees", len(employee_numbers))
    LOGGER.info("Generating %d certificate entries", count)

    batch_tag = int(time.time())
    results: list[SeedResult] = []

    for idx in range(1, count + 1):
        employee_no = rng.choice(employee_numbers)
        payload, certificate_no, files = _build_payload(
            index=idx,
            batch_tag=batch_tag,
            employee_no=employee_no,
            rng=rng,
            with_files=with_files,
        )

        target_url = f"{normalized_base}{normalized_prefix}/{employee_no}"
        result = _post_certificate(
            session=session,
            target_url=target_url,
            payload=payload,
            files=files,
            timeout_seconds=timeout_seconds,
            employee_no=employee_no,
            certificate_no=certificate_no,
        )
        results.append(result)

        if result.success:
            LOGGER.info(
                "[%02d/%02d] CREATED cert %s for %s (HTTP %s)",
                idx,
                count,
                result.certificate_no,
                result.employee_no,
                result.http_status,
            )
        else:
            LOGGER.error(
                "[%02d/%02d] FAILED  cert %s for %s (HTTP %s) -> %s",
                idx,
                count,
                result.certificate_no,
                result.employee_no,
                result.http_status,
                result.message,
            )

        if pause_ms > 0 and idx < count:
            time.sleep(pause_ms / 1000.0)

    return results


def log_summary(results: list[SeedResult]) -> None:
    """Log summary of seeding run."""
    total = len(results)
    success_count = sum(1 for result in results if result.success)
    fail_count = total - success_count

    LOGGER.info("--- Seeding Summary ---")
    LOGGER.info("Total attempted: %d", total)
    LOGGER.info("Successful: %d", success_count)
    LOGGER.info("Failed: %d", fail_count)

    if fail_count:
        LOGGER.info("Failed certificate records:")
        for result in results:
            if not result.success:
                LOGGER.info(
                    "- cert %s for %s (HTTP %s): %s",
                    result.certificate_no,
                    result.employee_no,
                    result.http_status,
                    result.message,
                )


def main() -> None:
    """Program entry point."""
    args = parse_args()
    logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)s | %(message)s")

    if args.count < 1:
        raise ValueError("count must be at least 1")

    if args.employee_page_size < 1:
        raise ValueError("employee-page-size must be at least 1")

    rng = random.Random(args.seed)
    results = seed_data(
        base_url=args.base_url,
        employee_endpoint=args.employee_endpoint,
        endpoint_prefix=args.endpoint,
        count=args.count,
        timeout_seconds=args.timeout,
        pause_ms=args.pause_ms,
        with_files=args.with_files,
        page_size=args.employee_page_size,
        rng=rng,
    )
    log_summary(results)


if __name__ == "__main__":
    main()
