"""Seed training tracking events through API endpoints.

Usage examples:
    python backend/scripts/seed_training_tracking.py
    python backend/scripts/seed_training_tracking.py --count 24 --seed 123
    python backend/scripts/seed_training_tracking.py --base-url http://127.0.0.1:8000

By default this targets:
    http://127.0.0.1:8000/api/training-tracking/events

Participants are intentionally left blank.
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


LOGGER = logging.getLogger("seed_training_tracking_api")

TRAINING_TOPICS = [
    "Records Digitization and Archiving",
    "Cybersecurity Awareness for Government Offices",
    "Performance Management System Orientation",
    "Public Sector Project Monitoring",
    "Data Privacy Act Compliance",
    "Government Procurement Fundamentals",
    "HR Analytics and Workforce Planning",
    "Ethical Leadership in Public Service",
    "Customer Service in Government Frontlines",
    "Risk Management and Internal Control",
]

TRAINING_TYPES = [
    "Technical",
    "Managerial",
    "Supervisory",
    "Foundational",
    "Leadership",
    "Compliance",
]

TRAINING_STATUSES = [
    "Planned",
    "Ongoing",
    "Completed",
    "Rescheduled",
]

CONDUCTED_BY_OPTIONS = [
    "Civil Service Commission",
    "Development Academy of the Philippines",
    "Department of Budget and Management",
    "Commission on Audit",
    "Department of Information and Communications Technology",
    "Local Government Academy",
    "In-house HRMO Training Team",
]

VENUES = [
    "HRMO Conference Hall",
    "Main Auditorium",
    "MIS Training Laboratory",
    "Online - Zoom",
    "Online - MS Teams",
    "City Learning and Development Center",
    "Regional Training Center",
]


@dataclass(frozen=True)
class SeedResult:
    """Result details for one training tracking insert call."""

    title: str
    participant_count: int
    success: bool
    http_status: int
    message: str


@dataclass(frozen=True)
class EmployeeIdentity:
    """Minimal employee details needed for participant assignment."""

    id: str
    employee_no: str


def parse_args() -> argparse.Namespace:
    """Parse command-line arguments."""
    parser = argparse.ArgumentParser(description="Seed training tracking events via API")
    parser.add_argument("--base-url", default="http://127.0.0.1:8000", help="API base URL")
    parser.add_argument(
        "--endpoint",
        default="/api/training-tracking/events",
        help="Training tracking endpoint path",
    )
    parser.add_argument(
        "--employee-endpoint",
        default="/api/employees",
        help="Employee listing endpoint path",
    )
    parser.add_argument("--count", type=int, default=24, help="Number of training events to create")
    parser.add_argument("--timeout", type=int, default=25, help="Request timeout in seconds")
    parser.add_argument("--pause-ms", type=int, default=120, help="Pause between requests in milliseconds")
    parser.add_argument("--seed", type=int, default=None, help="Optional random seed for reproducibility")
    parser.add_argument(
        "--employee-page-size",
        type=int,
        default=200,
        help="Page size when fetching employees",
    )
    parser.add_argument(
        "--min-participants",
        type=int,
        default=1,
        help="Minimum participants per training event",
    )
    parser.add_argument(
        "--max-participants",
        type=int,
        default=8,
        help="Maximum participants per training event",
    )
    return parser.parse_args()


def _fmt(value: date) -> str:
    """Format date as ISO date string."""
    return value.isoformat()


def _random_date(rng: random.Random, start_year: int, end_year: int) -> date:
    """Return a random date between Jan 1 of start_year and Dec 31 of end_year."""
    start = date(start_year, 1, 1)
    end = date(end_year, 12, 31)
    delta_days = max((end - start).days, 1)
    return start + timedelta(days=rng.randint(0, delta_days))


def _extract_message(body: Any) -> str:
    """Extract a human-readable message from the API response body."""
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


def _fetch_employees(
    session: requests.Session,
    base_url: str,
    employee_endpoint: str,
    timeout_seconds: int,
    page_size: int,
) -> list[EmployeeIdentity]:
    """Fetch active employees from the employees listing endpoint."""
    normalized_base = base_url.rstrip("/")
    normalized_endpoint = employee_endpoint if employee_endpoint.startswith("/") else f"/{employee_endpoint}"
    target_url = f"{normalized_base}{normalized_endpoint}"

    skip = 0
    employees: list[EmployeeIdentity] = []
    seen_ids: set[str] = set()

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
            employee_id = entry.get("id")
            employee_no = entry.get("employee_no") or entry.get("employeeNo") or ""
            if isinstance(employee_id, str) and employee_id and employee_id not in seen_ids:
                seen_ids.add(employee_id)
                employees.append(EmployeeIdentity(id=employee_id, employee_no=str(employee_no)))
                page_count += 1

        if page_count == 0:
            break

        has_next = bool(meta.get("has_next")) if isinstance(meta, dict) else len(data) >= page_size
        if not has_next:
            break

        skip += page_size

    return employees


def _build_payload(
    index: int,
    batch_tag: int,
    employees: list[EmployeeIdentity],
    min_participants: int,
    max_participants: int,
    rng: random.Random,
) -> tuple[str, int, dict[str, Any]]:
    """Build one training tracking event payload."""
    date_from = _random_date(rng, 2020, 2026)
    duration_days = rng.randint(1, 5)
    date_to = date_from + timedelta(days=duration_days)

    training_title = f"{rng.choice(TRAINING_TOPICS)} #{batch_tag % 1000}-{index:03d}"
    hours = rng.choice([4, 8, 12, 16, 24, 32, 40])

    max_allowed = min(max_participants, len(employees))
    min_allowed = min(min_participants, max_allowed)
    participant_count = rng.randint(min_allowed, max_allowed) if max_allowed > 0 else 0
    assigned = rng.sample(employees, k=participant_count) if participant_count > 0 else []
    participant_employee_ids = [employee.id for employee in assigned]

    payload: dict[str, Any] = {
        "training_title": training_title,
        "training_type": rng.choice(TRAINING_TYPES),
        "status": rng.choice(TRAINING_STATUSES),
        "conducted_by": rng.choice(CONDUCTED_BY_OPTIONS),
        "venue": rng.choice(VENUES),
        "date_from": _fmt(date_from),
        "date_to": _fmt(date_to),
        "hours": hours,
        "participant_employee_ids": participant_employee_ids,
    }

    return training_title, participant_count, payload


def _post_payload(
    session: requests.Session,
    url: str,
    payload: dict[str, Any],
    timeout_seconds: int,
    title: str,
    participant_count: int,
) -> SeedResult:
    """POST one training tracking payload and return normalized result."""
    try:
        response = session.post(url, json=payload, timeout=timeout_seconds)
        try:
            response_body: Any = response.json()
        except ValueError:
            response_body = None

        ok = response.ok and isinstance(response_body, dict) and bool(response_body.get("success", True))
        return SeedResult(
            title=title,
            participant_count=participant_count,
            success=ok,
            http_status=response.status_code,
            message=_extract_message(response_body),
        )
    except requests.RequestException as exc:
        return SeedResult(
            title=title,
            participant_count=participant_count,
            success=False,
            http_status=0,
            message=f"Request failed: {exc}",
        )


def seed_data(
    base_url: str,
    endpoint: str,
    employee_endpoint: str,
    count: int,
    timeout_seconds: int,
    pause_ms: int,
    employee_page_size: int,
    min_participants: int,
    max_participants: int,
    rng: random.Random,
) -> list[SeedResult]:
    """Insert multiple training event entries using the configured API endpoint."""
    normalized_base = base_url.rstrip("/")
    normalized_endpoint = endpoint if endpoint.startswith("/") else f"/{endpoint}"
    target_url = f"{normalized_base}{normalized_endpoint}"

    batch_tag = int(time.time())
    LOGGER.info("Target URL: %s", target_url)
    session = requests.Session()
    LOGGER.info("Fetching employees for participant assignment...")
    employees = _fetch_employees(
        session=session,
        base_url=normalized_base,
        employee_endpoint=employee_endpoint,
        timeout_seconds=timeout_seconds,
        page_size=employee_page_size,
    )
    if not employees:
        raise ValueError("No employees found. Seed employee records first.")

    LOGGER.info("Found %d employees for participant assignment", len(employees))
    LOGGER.info("Generating %d training tracking entries", count)
    results: list[SeedResult] = []

    for idx in range(1, count + 1):
        title, participant_count, payload = _build_payload(
            index=idx,
            batch_tag=batch_tag,
            employees=employees,
            min_participants=min_participants,
            max_participants=max_participants,
            rng=rng,
        )
        result = _post_payload(
            session=session,
            url=target_url,
            payload=payload,
            timeout_seconds=timeout_seconds,
            title=title,
            participant_count=participant_count,
        )
        results.append(result)

        if result.success:
            LOGGER.info(
                "[%02d/%02d] CREATED %s with %d participants (HTTP %s)",
                idx,
                count,
                result.title,
                result.participant_count,
                result.http_status,
            )
        else:
            LOGGER.error(
                "[%02d/%02d] FAILED  %s with %d participants (HTTP %s) -> %s",
                idx,
                count,
                result.title,
                result.participant_count,
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
    total_participants = sum(result.participant_count for result in results if result.success)

    LOGGER.info("--- Seeding Summary ---")
    LOGGER.info("Total attempted: %d", total)
    LOGGER.info("Successful: %d", success_count)
    LOGGER.info("Failed: %d", fail_count)
    LOGGER.info("Total participants assigned (successful only): %d", total_participants)

    if fail_count:
        LOGGER.info("Failed training titles:")
        for result in results:
            if not result.success:
                LOGGER.info("- %s (HTTP %s): %s", result.title, result.http_status, result.message)


def main() -> None:
    """Program entry point."""
    args = parse_args()
    logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)s | %(message)s")

    if args.count < 1:
        raise ValueError("count must be at least 1")
    if args.employee_page_size < 1:
        raise ValueError("employee-page-size must be at least 1")
    if args.min_participants < 0:
        raise ValueError("min-participants must be at least 0")
    if args.max_participants < 0:
        raise ValueError("max-participants must be at least 0")
    if args.min_participants > args.max_participants:
        raise ValueError("min-participants cannot be greater than max-participants")

    rng = random.Random(args.seed)
    results = seed_data(
        base_url=args.base_url,
        endpoint=args.endpoint,
        employee_endpoint=args.employee_endpoint,
        count=args.count,
        timeout_seconds=args.timeout,
        pause_ms=args.pause_ms,
        employee_page_size=args.employee_page_size,
        min_participants=args.min_participants,
        max_participants=args.max_participants,
        rng=rng,
    )
    log_summary(results)


if __name__ == "__main__":
    main()
