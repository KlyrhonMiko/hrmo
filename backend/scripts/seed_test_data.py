"""Seed realistic onboarding records through the API.

Usage examples:
    python backend/scripts/seed_onboard_api_data.py
    python backend/scripts/seed_onboard_api_data.py --count 25
    python backend/scripts/seed_onboard_api_data.py --base-url http://127.0.0.1:3000 --endpoint /api/employees/onboard

By default this targets the backend atomic endpoint:
    http://127.0.0.1:8000/api/employees/onboard-atomic
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


LOGGER = logging.getLogger("seed_onboard_api")


FIRST_NAMES_MALE = [
    "Juan",
    "Miguel",
    "Paolo",
    "Rafael",
    "Jose",
    "Mark",
    "Angelo",
    "Carl",
    "Noel",
    "Anthony",
]

FIRST_NAMES_FEMALE = [
    "Maria",
    "Ana",
    "Patricia",
    "Angela",
    "Sofia",
    "Camille",
    "Lourdes",
    "Therese",
    "Grace",
    "Catherine",
]

LAST_NAMES = [
    "Santos",
    "Reyes",
    "Dela Cruz",
    "Garcia",
    "Mendoza",
    "Aquino",
    "Castro",
    "Villanueva",
    "Fernandez",
    "Lopez",
    "Torres",
    "Bautista",
    "Ramos",
    "Diaz",
]

MIDDLE_NAMES = [
    "Cruz",
    "Bautista",
    "Navarro",
    "Valdez",
    "Morales",
    "Hernandez",
    "Alvarez",
    "Pascual",
    "Santiago",
    "Rivera",
]

OFFICES = [
    "COS",
    "COE",
    "CBA",
    "CHAS",
    "CAS",
    "CIT",
    "CCJE",
    "Admin",
    "Registrar",
    "Accounting",
    "HRMO",
    "Library",
    "Clinic",
    "MIS",
]

EMPLOYMENT_STATUSES = ["Teaching", "Non-Teaching", "COS"]
WORK_STATUSES = ["Permanent", "Temporary", "Casual", "Contractual", "COS"]
ELIGIBILITY_TYPES = [
    "Career Service Professional",
    "Career Service Subprofessional",
    "RA 1080",
    "BAR/Board Eligibility",
]
GOV_ID_TYPES = ["Passport", "GSIS", "SSS", "PRC", "Postal ID", "Driver's License"]

BARANGAYS = [
    "Poblacion",
    "San Roque",
    "San Isidro",
    "Bagong Silang",
    "Santa Maria",
    "Mabini",
    "Talon",
]

CITIES = [
    "Quezon City",
    "Makati City",
    "Pasig City",
    "Taguig City",
    "Iloilo City",
    "Davao City",
    "Cebu City",
]

PROVINCES = ["Metro Manila", "Cebu", "Davao del Sur", "Iloilo", "Laguna", "Batangas"]

DEPARTMENTS = [
    "Human Resource Management Office",
    "Accounting Department",
    "Planning and Development",
    "Administrative Services",
    "Procurement Office",
    "General Services Office",
]

TRAINING_TITLES = [
    "Records Management and Archiving",
    "Data Privacy and Information Security",
    "Public Service Ethics and Accountability",
    "Financial Management for Public Officers",
    "Digital Governance and e-Services",
    "Basic Leadership and Supervision",
]

VOLUNTARY_ORGS = [
    "Philippine Red Cross",
    "Barangay Disaster Response Team",
    "Community Outreach Volunteers",
    "Local Environmental Action Group",
]

SCHOOL_PREFIXES = [
    "San Isidro",
    "Sta. Maria",
    "Rizal",
    "Mabini",
    "Central",
    "National",
    "City",
]

SCHOOL_SUFFIXES = [
    "Elementary School",
    "National High School",
    "Science High School",
    "State University",
    "Polytechnic University",
]


@dataclass(frozen=True)
class SeedResult:
    """Result details for one API insert call."""

    employee_no: str
    success: bool
    http_status: int
    message: str


def parse_args() -> argparse.Namespace:
    """Parse command-line arguments."""
    parser = argparse.ArgumentParser(description="Seed realistic onboarding entries via API")
    parser.add_argument("--base-url", default="http://127.0.0.1:8000", help="API base URL")
    parser.add_argument(
        "--endpoint",
        default="/api/employees/onboard-atomic",
        help="Onboarding endpoint path (e.g. /api/employees/onboard or /api/employees/onboard-atomic)",
    )
    parser.add_argument("--count", type=int, default=24, help="Number of employees to create")
    parser.add_argument("--timeout", type=int, default=25, help="Request timeout in seconds")
    parser.add_argument("--pause-ms", type=int, default=120, help="Pause between requests in milliseconds")
    parser.add_argument("--seed", type=int, default=None, help="Optional random seed for reproducibility")
    return parser.parse_args()


def _random_date(rng: random.Random, start_year: int, end_year: int) -> date:
    """Return a random date between Jan 1 of start_year and Dec 31 of end_year."""
    start = date(start_year, 1, 1)
    end = date(end_year, 12, 31)
    delta_days = (end - start).days
    return start + timedelta(days=rng.randint(0, max(delta_days, 1)))


def _fmt(value: date) -> str:
    """Format date as ISO date string."""
    return value.isoformat()


def _digits(rng: random.Random, length: int) -> str:
    """Generate a numeric string with a fixed length."""
    return "".join(str(rng.randint(0, 9)) for _ in range(length))


def _school_name(rng: random.Random) -> str:
    """Generate a realistic school name."""
    return f"{rng.choice(SCHOOL_PREFIXES)} {rng.choice(SCHOOL_SUFFIXES)}"


def _address(rng: random.Random) -> dict[str, str]:
    """Generate a realistic address object based on onboard form structure."""
    return {
        "houseBlockLot": f"Blk {rng.randint(1, 18)} Lot {rng.randint(1, 45)}",
        "street": f"{rng.choice(['Rizal', 'Bonifacio', 'Mabini', 'Luna', 'Quezon'])} Street",
        "subdivision": f"{rng.choice(['Sunrise', 'Greenfield', 'Riverbend', 'Grandview'])} Subdivision",
        "barangay": rng.choice(BARANGAYS),
        "cityMunicipality": rng.choice(CITIES),
        "province": rng.choice(PROVINCES),
        "zipCode": str(rng.randint(1000, 9800)),
    }


def _build_education(rng: random.Random, birth_year: int) -> list[dict[str, str]]:
    """Build education array aligned with the onboard page structure."""
    levels = ["Elementary", "Secondary", "College"]
    entries: list[dict[str, str]] = []

    elementary_from = birth_year + 6
    secondary_from = elementary_from + 6
    college_from = secondary_from + 4

    ranges = [
        (levels[0], elementary_from, elementary_from + 6, "Completed"),
        (levels[1], secondary_from, secondary_from + 4, "Completed"),
        (levels[2], college_from, college_from + 4, "Graduated"),
    ]

    for level, start, end, attainment in ranges:
        entries.append(
            {
                "level": level,
                "schoolName": _school_name(rng),
                "basicEducationDegreeCourse": "Bachelor of Science in Public Administration"
                if level == "College"
                else "General Curriculum",
                "periodFrom": str(start),
                "periodTo": str(end),
                "highestLevelUnitsEarned": attainment,
                "yearGraduated": str(end),
                "scholarshipAcademicHonorsReceived": rng.choice(["", "With Honors", "Dean's List"]),
            }
        )

    if rng.random() < 0.35:
        grad_from = college_from + 6
        grad_to = grad_from + 2
        entries.append(
            {
                "level": "Graduate Studies",
                "schoolName": _school_name(rng),
                "basicEducationDegreeCourse": "Master in Public Management",
                "periodFrom": str(grad_from),
                "periodTo": str(grad_to),
                "highestLevelUnitsEarned": "Graduated",
                "yearGraduated": str(grad_to),
                "scholarshipAcademicHonorsReceived": "",
            }
        )

    return entries


def _build_payload(index: int, batch_tag: int, rng: random.Random) -> tuple[str, dict[str, Any]]:
    """Build one realistic onboarding payload matching the employees/onboard flow."""
    sex = rng.choice(["Male", "Female"])
    first_name = rng.choice(FIRST_NAMES_MALE if sex == "Male" else FIRST_NAMES_FEMALE)
    middle_name = rng.choice(MIDDLE_NAMES)
    surname = rng.choice(LAST_NAMES)

    employee_no = f"EMP-{date.today().year}-{_digits(rng, 4)}-{index:03d}"
    office = rng.choice(OFFICES)
    employment_status = rng.choice(EMPLOYMENT_STATUSES)

    date_of_birth = _random_date(rng, 1979, 2000)
    date_hired = _random_date(rng, max(date_of_birth.year + 20, 2001), 2026)
    work_date_from = _random_date(rng, max(date_hired.year, 2005), 2026)

    civil_status = rng.choice(["Single", "Married", "Married", "Separated"])
    has_spouse = civil_status == "Married"

    father_first = rng.choice(FIRST_NAMES_MALE)
    mother_first = rng.choice(FIRST_NAMES_FEMALE)

    children: list[dict[str, str]] = []
    if has_spouse and rng.random() < 0.65:
        for _ in range(rng.randint(1, 2)):
            child_first = rng.choice(FIRST_NAMES_MALE + FIRST_NAMES_FEMALE)
            child_middle = rng.choice(MIDDLE_NAMES)
            child_birth = _random_date(rng, max(date_hired.year, 2010), 2024)
            children.append(
                {
                    "fullName": f"{surname}, {child_first} {child_middle}",
                    "surname": surname,
                    "firstName": child_first,
                    "middleName": child_middle,
                    "nameExtension": "",
                    "dateOfBirth": _fmt(child_birth),
                }
            )

    work_salary = str(rng.randint(28000, 62000))
    training_from = _random_date(rng, 2020, 2025)
    training_to = training_from + timedelta(days=rng.randint(1, 4))
    voluntary_from = _random_date(rng, 2018, 2024)
    voluntary_to = voluntary_from + timedelta(days=rng.randint(200, 620))
    eligibility_exam = _random_date(rng, 2010, 2024)

    payload: dict[str, Any] = {
        "employeeMeta": {
            "employeeNo": employee_no,
            "positionTitle": rng.choice(
                [
                    "Administrative Officer I",
                    "HR Assistant",
                    "Planning Officer",
                    "Records Officer",
                    "Budget Analyst",
                ]
            ),
            "dateHired": _fmt(date_hired),
        },
        "formData": {
            "office": office,
            "employmentStatus": employment_status,
            "dateAccomplished": _fmt(date.today()),
            "personalInfo": {
                "surname": surname,
                "firstName": first_name,
                "middleName": middle_name,
                "nameExtension": "",
                "dateOfBirth": _fmt(date_of_birth),
                "placeOfBirth": rng.choice(CITIES),
                "sex": sex,
                "civilStatus": civil_status,
                "height": f"{rng.uniform(1.52, 1.83):.2f}",
                "weight": str(rng.randint(50, 88)),
                "bloodType": rng.choice(["A+", "A-", "B+", "B-", "AB+", "O+"]),
                "gsisIdNo": f"{_digits(rng, 4)}-{_digits(rng, 7)}-{_digits(rng, 1)}",
                "pagIbigIdNo": _digits(rng, 12),
                "philhealthNo": f"{_digits(rng, 2)}-{_digits(rng, 9)}-{_digits(rng, 1)}",
                "sssNo": f"{_digits(rng, 2)}-{_digits(rng, 7)}-{_digits(rng, 1)}",
                "tinNo": f"{_digits(rng, 3)}-{_digits(rng, 3)}-{_digits(rng, 3)}",
                "agencyEmployeeNo": f"AEN-{batch_tag}-{index:03d}",
                "citizenship": "Filipino",
                "residentialAddress": _address(rng),
                "permanentAddress": _address(rng),
                "telephoneNo": f"(02) 8{_digits(rng, 6)}",
                "mobileNo": f"09{_digits(rng, 9)}",
                "email": f"{first_name.lower()}.{surname.lower().replace(' ', '')}.{index}@hrmo.local",
            },
            "familyBackground": {
                "spouseSurname": rng.choice(LAST_NAMES) if has_spouse else "",
                "spouseFirstName": rng.choice(FIRST_NAMES_FEMALE if sex == "Male" else FIRST_NAMES_MALE)
                if has_spouse
                else "",
                "spouseMiddleName": rng.choice(MIDDLE_NAMES) if has_spouse else "",
                "spouseNameExtension": "",
                "spouseOccupation": "Teacher" if has_spouse else "",
                "spouseEmployerBusinessName": "City Schools Division" if has_spouse else "",
                "spouseBusinessAddress": rng.choice(CITIES) if has_spouse else "",
                "spouseTelephoneNo": f"(02) 8{_digits(rng, 6)}" if has_spouse else "",
                "fatherSurname": surname,
                "fatherFirstName": father_first,
                "fatherMiddleName": rng.choice(MIDDLE_NAMES),
                "fatherNameExtension": "Sr.",
                "motherMaidenSurname": rng.choice(LAST_NAMES),
                "motherFirstName": mother_first,
                "motherMiddleName": rng.choice(MIDDLE_NAMES),
                "children": children,
            },
            "education": _build_education(rng, date_of_birth.year),
            "civilServiceEligibility": [
                {
                    "careerService": rng.choice(ELIGIBILITY_TYPES),
                    "rating": str(rng.randint(80, 95)),
                    "dateOfExamination": _fmt(eligibility_exam),
                    "placeOfExamination": rng.choice(CITIES),
                    "licenseNumber": f"ELG-{_digits(rng, 7)}",
                    "dateOfValidity": _fmt(eligibility_exam + timedelta(days=365 * 5)),
                }
            ],
            "workExperience": [
                {
                    "dateFrom": _fmt(work_date_from),
                    "dateTo": "",
                    "positionTitle": rng.choice(
                        [
                            "Administrative Officer I",
                            "Administrative Assistant II",
                            "Records Officer",
                            "Planning Officer I",
                        ]
                    ),
                    "department": rng.choice(DEPARTMENTS),
                    "monthlySalary": work_salary,
                    "salaryGrade": rng.choice(["10", "11", "12", "13", "15"]),
                    "statusOfAppointment": rng.choice(WORK_STATUSES),
                    "isGovernmentService": True,
                }
            ],
            "voluntaryWork": [
                {
                    "organizationName": rng.choice(VOLUNTARY_ORGS),
                    "organizationAddress": f"{rng.choice(CITIES)}, {rng.choice(PROVINCES)}",
                    "dateFrom": _fmt(voluntary_from),
                    "dateTo": _fmt(voluntary_to),
                    "numberOfHours": str(rng.randint(40, 320)),
                    "positionNatureOfWork": rng.choice(["Volunteer", "Coordinator", "Facilitator"]),
                }
            ],
            "learningDevelopment": [
                {
                    "title": rng.choice(TRAINING_TITLES),
                    "dateFrom": _fmt(training_from),
                    "dateTo": _fmt(training_to),
                    "numberOfHours": str(rng.choice([8, 12, 16, 24, 40])),
                    "type": rng.choice(["Managerial", "Supervisory", "Technical"]),
                    "conductedSponsoredBy": rng.choice(["CSC", "DILG", "TESDA", "DBM", "DOLE"]),
                }
            ],
            "otherInfo": {
                "specialSkillsHobbies": [
                    rng.choice(["Public speaking", "Excel analytics", "Report writing", "Community facilitation"]),
                    rng.choice(["Data encoding", "Records management", "Budget tracking", "Meeting facilitation"]),
                ],
                "nonAcademicDistinctions": [rng.choice(["Employee of the Month", "Service Excellence Award", "Leadership Award"])],
                "membershipInAssociations": [
                    rng.choice(
                        [
                            "Philippine Society for Public Administration",
                            "HR Practitioners Association",
                            "Local Government Officers Guild",
                        ]
                    )
                ],
            },
            "references": [
                {
                    "name": f"{rng.choice(FIRST_NAMES_MALE + FIRST_NAMES_FEMALE)} {rng.choice(LAST_NAMES)}",
                    "address": f"{rng.choice(CITIES)}, {rng.choice(PROVINCES)}",
                    "telephoneNo": f"09{_digits(rng, 9)}",
                },
                {
                    "name": f"{rng.choice(FIRST_NAMES_MALE + FIRST_NAMES_FEMALE)} {rng.choice(LAST_NAMES)}",
                    "address": f"{rng.choice(CITIES)}, {rng.choice(PROVINCES)}",
                    "telephoneNo": f"09{_digits(rng, 9)}",
                },
                {
                    "name": f"{rng.choice(FIRST_NAMES_MALE + FIRST_NAMES_FEMALE)} {rng.choice(LAST_NAMES)}",
                    "address": f"{rng.choice(CITIES)}, {rng.choice(PROVINCES)}",
                    "telephoneNo": f"09{_digits(rng, 9)}",
                },
            ],
            "governmentIssuedId": {
                "idType": rng.choice(GOV_ID_TYPES),
                "idNumber": f"ID-{_digits(rng, 10)}",
                "dateOfIssuance": _fmt(_random_date(rng, 2018, 2025)),
                "placeOfIssuance": rng.choice(CITIES),
            },
        },
    }

    return employee_no, payload


def _extract_message(body: Any) -> str:
    """Extract a human-readable message from the API response body."""
    if not isinstance(body, dict):
        return "No JSON body"

    if "message" in body and body.get("message"):
        return str(body.get("message"))

    data = body.get("data")
    if isinstance(data, dict):
        if data.get("message"):
            return str(data.get("message"))
        if data.get("status_code"):
            return f"status_code={data.get('status_code')}"

    return "No message"


def _post_payload(
    session: requests.Session,
    url: str,
    payload: dict[str, Any],
    timeout_seconds: int,
    employee_no: str,
) -> SeedResult:
    """POST one onboarding payload and return normalized result."""
    try:
        response = session.post(url, json=payload, timeout=timeout_seconds)
        try:
            response_body: Any = response.json()
        except ValueError:
            response_body = None

        ok = response.ok and isinstance(response_body, dict) and bool(response_body.get("success", True))
        message = _extract_message(response_body)
        return SeedResult(
            employee_no=employee_no,
            success=ok,
            http_status=response.status_code,
            message=message,
        )
    except requests.RequestException as exc:
        return SeedResult(
            employee_no=employee_no,
            success=False,
            http_status=0,
            message=f"Request failed: {exc}",
        )


def seed_data(
    base_url: str,
    endpoint: str,
    count: int,
    timeout_seconds: int,
    pause_ms: int,
    rng: random.Random,
) -> list[SeedResult]:
    """Insert multiple onboarding entries using the configured API endpoint."""
    normalized_base = base_url.rstrip("/")
    normalized_endpoint = endpoint if endpoint.startswith("/") else f"/{endpoint}"
    target_url = f"{normalized_base}{normalized_endpoint}"

    batch_tag = int(time.time())
    LOGGER.info("Target URL: %s", target_url)
    LOGGER.info("Generating %d realistic onboarding entries", count)

    session = requests.Session()
    results: list[SeedResult] = []

    for idx in range(1, count + 1):
        employee_no, payload = _build_payload(idx, batch_tag, rng)
        result = _post_payload(
            session=session,
            url=target_url,
            payload=payload,
            timeout_seconds=timeout_seconds,
            employee_no=employee_no,
        )
        results.append(result)

        if result.success:
            LOGGER.info("[%02d/%02d] CREATED %s (HTTP %s)", idx, count, result.employee_no, result.http_status)
        else:
            LOGGER.error(
                "[%02d/%02d] FAILED  %s (HTTP %s) -> %s",
                idx,
                count,
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
        LOGGER.info("Failed employee numbers:")
        for result in results:
            if not result.success:
                LOGGER.info("- %s (HTTP %s): %s", result.employee_no, result.http_status, result.message)


def main() -> None:
    """Program entry point."""
    args = parse_args()
    logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)s | %(message)s")

    if args.count < 1:
        raise ValueError("count must be at least 1")

    rng = random.Random(args.seed)
    results = seed_data(
        base_url=args.base_url,
        endpoint=args.endpoint,
        count=args.count,
        timeout_seconds=args.timeout,
        pause_ms=args.pause_ms,
        rng=rng,
    )
    log_summary(results)


if __name__ == "__main__":
    main()